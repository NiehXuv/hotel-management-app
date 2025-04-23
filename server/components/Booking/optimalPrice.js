// optimalPrice.js
const { database } = require("../config/firebaseconfig");
const { ref, get, update } = require("firebase/database");

const optimalPrice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || typeof bookingId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing bookingId",
      });
    }

    const bookingPath = `Booking/${bookingId}`;
    const bookingRef = ref(database, bookingPath);
    const bookingSnap = await get(bookingRef);

    if (!bookingSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const bookingData = bookingSnap.val();
    const { bookIn, eta, bookOut, etd, hotelId, roomId } = bookingData;

    if (!bookIn || !eta || !bookOut || !etd || !hotelId || !roomId) {
      return res.status(400).json({
        success: false,
        error: "Booking data is incomplete (missing bookIn, eta, bookOut, etd, hotelId, or roomId)",
      });
    }

    const roomPath = `Hotel/${hotelId}/Room/${roomId}`;
    const roomRef = ref(database, roomPath);
    const roomSnap = await get(roomRef);

    if (!roomSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }

    const roomData = roomSnap.val();
    const { PriceByHour, PriceByNight } = roomData;

    if (PriceByHour == null || PriceByNight == null) {
      return res.status(400).json({
        success: false,
        error: "Room pricing data is incomplete (missing PriceByHour or PriceByNight)",
      });
    }

    // Fetch pricing policies
    const globalPolicyPath = `Hotel/${hotelId}/PricingPolicy/global`;
    const roomPolicyPath = `Hotel/${hotelId}/PricingPolicy/Room/${roomId}`;
    const globalPolicyRef = ref(database, globalPolicyPath);
    const roomPolicyRef = ref(database, roomPolicyPath);

    const globalPolicySnap = await get(globalPolicyRef);
    const roomPolicySnap = await get(roomPolicyRef);

    const globalPolicy = globalPolicySnap.exists() ? globalPolicySnap.val() : {};
    const roomPolicy = roomPolicySnap.exists() ? roomPolicySnap.val() : {};

    // Combine policies (room-specific overrides global)
    const pricingPolicy = {
      defaultCheckInTime: roomPolicy.defaultCheckInTime || globalPolicy.defaultCheckInTime || "14:00",
      defaultCheckOutTime: roomPolicy.defaultCheckOutTime || globalPolicy.defaultCheckOutTime || "12:00",
      earlyCheckInFee: roomPolicy.earlyCheckInFee || globalPolicy.earlyCheckInFee,
      lateCheckOutFee: roomPolicy.lateCheckOutFee || globalPolicy.lateCheckOutFee,
      minStayRequirement: roomPolicy.minStayRequirement || globalPolicy.minStayRequirement,
      specialRates: roomPolicy.specialRates || globalPolicy.specialRates || [],
      minStayDiscount: roomPolicy.minStayDiscount || globalPolicy.minStayDiscount,
      seasonalAdjustment: roomPolicy.seasonalAdjustment || globalPolicy.seasonalAdjustment || [],
      extraFees: [...(globalPolicy.extraFees || []), ...(roomPolicy.extraFees || [])],
    };

    const checkInDateTime = new Date(`${bookIn}T${eta}:00`);
    const checkOutDateTime = new Date(`${bookOut}T${etd}:00`);

    if (isNaN(checkInDateTime) || isNaN(checkOutDateTime)) {
      return res.status(400).json({
        success: false,
        error: "Invalid date or time format in booking data",
      });
    }

    const durationMs = checkOutDateTime - checkInDateTime;
    const totalHours = Math.ceil(durationMs / (1000 * 60 * 60));

    if (totalHours <= 0) {
      return res.status(400).json({
        success: false,
        error: "Check-out time must be after check-in time",
      });
    }

    const checkInDate = new Date(bookIn);
    const checkOutDate = new Date(bookOut);
    let nights = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const checkInHour = parseInt(eta.split(":")[0]) + parseInt(eta.split(":")[1]) / 60;
    const checkOutHour = parseInt(etd.split(":")[0]) + parseInt(etd.split(":")[1]) / 60;

    // Calculate effective nights and hours considering hotel check-in/check-out times
    const defaultCheckInHour = parseInt(pricingPolicy.defaultCheckInTime.split(":")[0]) +
      parseInt(pricingPolicy.defaultCheckInTime.split(":")[1]) / 60;
    const defaultCheckOutHour = parseInt(pricingPolicy.defaultCheckOutTime.split(":")[0]) +
      parseInt(pricingPolicy.defaultCheckOutTime.split(":")[1]) / 60;

    // Adjust nights and hours for early check-in and late check-out
    let earlyCheckInHours = 0;
    let lateCheckOutHours = 0;
    let effectiveNights = nights;
    let effectiveHours = totalHours;

    // Early check-in: If check-in time is before default check-in time
    if (checkInHour < defaultCheckInHour) {
      earlyCheckInHours = defaultCheckInHour - checkInHour;
      effectiveHours -= earlyCheckInHours; // Subtract early check-in hours from total
    }

    // Late check-out: If check-out time is after default check-out time
    if (checkOutHour > defaultCheckOutHour) {
      lateCheckOutHours = checkOutHour - defaultCheckOutHour;
      effectiveHours -= lateCheckOutHours; // Subtract late check-out hours from total
    }

    // Recalculate effective nights based on adjusted hours
    effectiveNights = Math.floor(effectiveHours / 24);
    let remainingHours = effectiveHours - (effectiveNights * 24);

    if (remainingHours > 0) {
      const remainingHoursCost = remainingHours * PriceByHour;
      if (remainingHoursCost > PriceByNight) {
        effectiveNights += 1;
        remainingHours = 0;
      }
    } else {
      remainingHours = 0;
    }

    // Calculate base prices
    let hourlyPrice = totalHours * PriceByHour;
    let nightlyPrice = (effectiveNights * PriceByNight) + (remainingHours * PriceByHour);

    // Apply pricing policy adjustments
    let adjustedHourlyPrice = hourlyPrice;
    let adjustedNightlyPrice = nightlyPrice;
    let adjustments = {
      seasonalAdjustment: 1,
      specialRateAdjustment: 1,
      discountApplied: 0,
      earlyCheckInFee: 0,
      lateCheckOutFee: 0,
      minStayPenalty: 0,
      extraFees: [],
    };

    // Seasonal adjustment
    const checkIn = new Date(checkInDateTime);
    for (const adjustment of pricingPolicy.seasonalAdjustment) {
      const start = new Date(adjustment.startDate);
      const end = new Date(adjustment.endDate);
      if (checkIn >= start && checkIn <= end) {
        adjustments.seasonalAdjustment = adjustment.multiplier;
        break;
      }
    }

    // Special rates (e.g., weekends, holidays)
    const checkInDay = checkIn.toLocaleString('en-US', { weekday: 'long' });
    for (const rate of pricingPolicy.specialRates) {
      if (rate.type === "weekend" && rate.days.includes(checkInDay)) {
        adjustments.specialRateAdjustment = rate.multiplier;
      } else if (rate.type === "holiday") {
        const start = new Date(rate.startDate);
        const end = new Date(rate.endDate);
        if (checkIn >= start && checkIn <= end) {
          adjustments.specialRateAdjustment = rate.multiplier;
        }
      }
    }

    adjustedHourlyPrice *= adjustments.seasonalAdjustment * adjustments.specialRateAdjustment;
    adjustedNightlyPrice *= adjustments.seasonalAdjustment * adjustments.specialRateAdjustment;

    // Minimum stay discount
    if (pricingPolicy.minStayDiscount && effectiveNights >= pricingPolicy.minStayDiscount.minNights) {
      const discount = pricingPolicy.minStayDiscount.discountPercentage / 100;
      adjustments.discountApplied = discount;
      adjustedHourlyPrice *= (1 - discount);
      adjustedNightlyPrice *= (1 - discount);
    }

    // Minimum stay requirement penalty
    if (pricingPolicy.minStayRequirement && effectiveNights < pricingPolicy.minStayRequirement.minNights) {
      adjustments.minStayPenalty = pricingPolicy.minStayRequirement.penaltyFee;
      adjustedHourlyPrice += adjustments.minStayPenalty;
      adjustedNightlyPrice += adjustments.minStayPenalty;
    }

    // Early check-in fee
    if (earlyCheckInHours > 0 && pricingPolicy.earlyCheckInFee) {
      if (pricingPolicy.earlyCheckInFee.type === "hourly") {
        adjustments.earlyCheckInFee = earlyCheckInHours * pricingPolicy.earlyCheckInFee.amount;
      } else if (pricingPolicy.earlyCheckInFee.type === "flat") {
        adjustments.earlyCheckInFee = pricingPolicy.earlyCheckInFee.amount;
      }
      adjustedHourlyPrice += adjustments.earlyCheckInFee;
      adjustedNightlyPrice += adjustments.earlyCheckInFee;
    }

    // Late check-out fee
    if (lateCheckOutHours > 0 && pricingPolicy.lateCheckOutFee) {
      if (pricingPolicy.lateCheckOutFee.type === "hourly") {
        adjustments.lateCheckOutFee = lateCheckOutHours * pricingPolicy.lateCheckOutFee.amount;
      } else if (pricingPolicy.lateCheckOutFee.type === "flat") {
        adjustments.lateCheckOutFee = pricingPolicy.lateCheckOutFee.amount;
      }
      adjustedHourlyPrice += adjustments.lateCheckOutFee;
      adjustedNightlyPrice += adjustments.lateCheckOutFee;
    }

    // Extra fees
    for (const fee of pricingPolicy.extraFees) {
      let feeAmount = 0;
      if (fee.per === "booking") {
        feeAmount = fee.amount;
      } else if (fee.per === "night") {
        feeAmount = fee.amount * effectiveNights;
      } else if (fee.per === "hour") {
        // Already handled in earlyCheckInFee/lateCheckOutFee
        continue;
      }
      adjustments.extraFees.push({ type: fee.type, amount: feeAmount });
      adjustedHourlyPrice += feeAmount;
      adjustedNightlyPrice += feeAmount;
    }

    const optimalPrice = Math.min(adjustedHourlyPrice, adjustedNightlyPrice);
    const pricingMethod = adjustedHourlyPrice <= adjustedNightlyPrice ? "hourly" : "nightly";

    await update(bookingRef, {
      optimalPrice: optimalPrice,
      pricingMethod: pricingMethod,
      pricingAdjustments: adjustments,
    });

    return res.status(200).json({
      success: true,
      data: {
        bookingId,
        totalHours,
        nights: effectiveNights,
        additionalHours: remainingHours,
        earlyCheckInHours,
        lateCheckOutHours,
        baseHourlyPrice: hourlyPrice,
        baseNightlyPrice: nightlyPrice,
        adjustedHourlyPrice: Number(adjustedHourlyPrice.toFixed(2)),
        adjustedNightlyPrice: Number(adjustedNightlyPrice.toFixed(2)),
        optimalPrice: Number(optimalPrice.toFixed(2)),
        pricingMethod,
        adjustments,
      },
      message: "Optimal price calculated and stored successfully",
    });
  } catch (error) {
    console.error("Error calculating optimal price:", {
      error: error.message,
      stack: error.stack,
      bookingId: req.params.bookingId,
    });
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = { optimalPrice };