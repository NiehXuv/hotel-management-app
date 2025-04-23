// pricingPolicy.js
const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

const setPricingPolicy = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { scope, minStayDiscount, seasonalAdjustment, extraFees, defaultCheckInTime, defaultCheckOutTime, earlyCheckInFee, lateCheckOutFee, minStayRequirement, specialRates } = req.body;

    console.log(`setPricingPolicy: hotelId=${hotelId}, scope=${scope}, req.body:`, req.body);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        error: "Hotel ID is required",
      });
    }

    if (!scope || !["global", "room"].includes(scope)) {
      return res.status(400).json({
        success: false,
        error: "Scope must be 'global' or 'room'",
      });
    }

    const hotelRef = ref(database, `Hotel/${hotelId}`);
    const hotelSnap = await get(hotelRef);
    if (!hotelSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `Hotel with ID ${hotelId} not found`,
      });
    }

    const policyPath = scope === "global"
      ? `Hotel/${hotelId}/PricingPolicy/global`
      : `Hotel/${hotelId}/PricingPolicy/Room/${req.body.roomId}`;

    if (scope === "room" && !req.body.roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required for room scope",
      });
    }

    const policyRef = ref(database, policyPath);
    const policyData = {};

    if (defaultCheckInTime) {
      policyData.defaultCheckInTime = defaultCheckInTime;
    }

    if (defaultCheckOutTime) {
      policyData.defaultCheckOutTime = defaultCheckOutTime;
    }

    if (earlyCheckInFee) {
      if (
        !earlyCheckInFee.type ||
        !["hourly", "flat"].includes(earlyCheckInFee.type) ||
        earlyCheckInFee.amount < 0 ||
        !earlyCheckInFee.before
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid earlyCheckInFee: must have type ('hourly' or 'flat'), amount >= 0, and before time",
        });
      }
      policyData.earlyCheckInFee = earlyCheckInFee;
    }

    if (lateCheckOutFee) {
      if (
        !lateCheckOutFee.type ||
        !["hourly", "flat"].includes(lateCheckOutFee.type) ||
        lateCheckOutFee.amount < 0 ||
        !lateCheckOutFee.after
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid lateCheckOutFee: must have type ('hourly' or 'flat'), amount >= 0, and after time",
        });
      }
      policyData.lateCheckOutFee = lateCheckOutFee;
    }

    if (minStayRequirement) {
      if (
        typeof minStayRequirement.minNights !== "number" ||
        minStayRequirement.minNights < 0 ||
        typeof minStayRequirement.penaltyFee !== "number" ||
        minStayRequirement.penaltyFee < 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid minStayRequirement: minNights must be >= 0, penaltyFee must be >= 0",
        });
      }
      policyData.minStayRequirement = minStayRequirement;
    }

    // Always include specialRates, even if empty
    if (Array.isArray(specialRates)) {
      if (!Array.isArray(specialRates)) {
        return res.status(400).json({
          success: false,
          error: "specialRates must be an array",
        });
      }
      for (const rate of specialRates) {
        if (rate.type === "weekend") {
          if (!rate.days || !Array.isArray(rate.days) || rate.days.length === 0) {
            return res.status(400).json({
              success: false,
              error: "Weekend special rates must specify days",
            });
          }
        } else if (rate.type === "holiday") {
          const start = new Date(rate.startDate);
          const end = new Date(rate.endDate);
          if (isNaN(start) || isNaN(end) || start >= end) {
            return res.status(400).json({
              success: false,
              error: "Holiday special rates must have valid startDate and endDate, with startDate < endDate",
            });
          }
        }
        if (!rate.multiplier || rate.multiplier <= 0) {
          return res.status(400).json({
            success: false,
            error: "Special rates must have a multiplier > 0",
          });
        }
      }
      policyData.specialRates = specialRates;
    } else {
      policyData.specialRates = [];
    }

    // Handle minStayDiscount with defaults
    if (minStayDiscount) {
      const sanitizedMinNights = Number(minStayDiscount.minNights) || 0;
      const sanitizedDiscountPercentage = Number(minStayDiscount.discountPercentage) || 0;

      if (
        sanitizedMinNights < 0 ||
        sanitizedDiscountPercentage < 0 ||
        sanitizedDiscountPercentage > 100
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid minStayDiscount: minNights must be >= 0, discountPercentage must be between 0 and 100",
        });
      }
      policyData.minStayDiscount = {
        minNights: sanitizedMinNights,
        discountPercentage: sanitizedDiscountPercentage,
      };
    } else {
      policyData.minStayDiscount = { minNights: 0, discountPercentage: 0 };
    }

    // Always include seasonalAdjustment, even if empty
    if (Array.isArray(seasonalAdjustment)) {
      if (!Array.isArray(seasonalAdjustment)) {
        return res.status(400).json({
          success: false,
          error: "seasonalAdjustment must be an array",
        });
      }
      for (const adjustment of seasonalAdjustment) {
        const start = new Date(adjustment.startDate);
        const end = new Date(adjustment.endDate);
        if (isNaN(start) || isNaN(end) || start >= end || !adjustment.multiplier || adjustment.multiplier <= 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid seasonalAdjustment: startDate and endDate must be valid dates, startDate < endDate, multiplier > 0",
          });
        }
      }
      policyData.seasonalAdjustment = seasonalAdjustment;
    } else {
      policyData.seasonalAdjustment = [];
    }

    // Always include extraFees, even if empty
    if (Array.isArray(extraFees)) {
      if (!Array.isArray(extraFees)) {
        return res.status(400).json({
          success: false,
          error: "extraFees must be an array",
        });
      }
      for (const fee of extraFees) {
        if (
          !fee.type ||
          typeof fee.amount !== "number" ||
          fee.amount < 0 ||
          !fee.per ||
          !["booking", "night", "hour"].includes(fee.per) ||
          (fee.per === "hour" && !fee.after)
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid extraFees: must have type, amount >= 0, per as 'booking', 'night', or 'hour', and 'after' for hourly fees",
          });
        }
      }
      policyData.extraFees = extraFees;
    } else {
      policyData.extraFees = [];
    }

    console.log("Saving policyData to database:", policyData);
    await set(policyRef, policyData);

    return res.status(200).json({
      success: true,
      message: `Pricing policy for ${scope} scope updated successfully`,
      data: policyData,
    });
  } catch (error) {
    console.error("Error setting pricing policy:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const getPricingPolicy = async (req, res) => {
  try {
    const { hotelId, scope, roomId } = req.query;

    console.log(`getPricingPolicy: hotelId=${hotelId}, scope=${scope}, roomId=${roomId}`);

    if (!hotelId || !scope || !["global", "room"].includes(scope)) {
      return res.status(400).json({
        success: false,
        error: "Hotel ID and scope ('global' or 'room') are required",
      });
    }

    if (scope === "room" && !roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required for room scope",
      });
    }

    const hotelRef = ref(database, `Hotel/${hotelId}`);
    const hotelSnap = await get(hotelRef);
    if (!hotelSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `Hotel with ID ${hotelId} not found`,
      });
    }

    const policyPath = scope === "global"
      ? `Hotel/${hotelId}/PricingPolicy/global`
      : `Hotel/${hotelId}/PricingPolicy/Room/${roomId}`;
    const policyRef = ref(database, policyPath);
    const policySnap = await get(policyRef);

    if (!policySnap.exists()) {
      return res.status(200).json({
        success: true,
        data: {},
        message: "No pricing policy found for this scope",
      });
    }

    return res.status(200).json({
      success: true,
      data: policySnap.val(),
    });
  } catch (error) {
    console.error("Error fetching pricing policy:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = { setPricingPolicy, getPricingPolicy };