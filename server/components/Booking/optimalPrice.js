const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

const optimalPrice = async (req, res) => {
    try {
        // Extract bookingId from the URL parameters
        const { bookingId } = req.params;

        // Validate bookingId
        if (!bookingId || typeof bookingId !== "string") {
            return res.status(400).json({
                success: false,
                error: "Invalid or missing bookingId"
            });
        }

        // Fetch booking data
        const bookingPath = `Booking/${bookingId}`;
        const bookingRef = ref(database, bookingPath);
        const bookingSnap = await get(bookingRef);

        if (!bookingSnap.exists()) {
            return res.status(404).json({
                success: false,
                error: "Booking not found"
            });
        }

        const bookingData = bookingSnap.val();
        const { bookIn, eta, bookOut, etd, hotelId, roomId } = bookingData;

        // Validate booking data
        if (!bookIn || !eta || !bookOut || !etd || !hotelId || !roomId) {
            return res.status(400).json({
                success: false,
                error: "Booking data is incomplete (missing bookIn, eta, bookOut, etd, hotelId, or roomId)"
            });
        }

        // Fetch room data
        const roomPath = `Hotel/${hotelId}/Room/${roomId}`;
        const roomRef = ref(database, roomPath);
        const roomSnap = await get(roomRef);

        if (!roomSnap.exists()) {
            return res.status(404).json({
                success: false,
                error: "Room not found"
            });
        }

        const roomData = roomSnap.val();
        const { PriceByHour, PriceByNight } = roomData;

        // Validate room pricing data
        if (PriceByHour == null || PriceByNight == null) {
            return res.status(400).json({
                success: false,
                error: "Room pricing data is incomplete (missing PriceByHour or PriceByNight)"
            });
        }

        // Combine dates and times for check-in and check-out
        const checkInDateTime = new Date(`${bookIn}T${eta}:00`);
        const checkOutDateTime = new Date(`${bookOut}T${etd}:00`);

        if (isNaN(checkInDateTime) || isNaN(checkOutDateTime)) {
            return res.status(400).json({
                success: false,
                error: "Invalid date or time format in booking data"
            });
        }

        // Calculate total duration in hours
        const durationMs = checkOutDateTime - checkInDateTime;
        const totalHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Convert milliseconds to hours, round up

        if (totalHours <= 0) {
            return res.status(400).json({
                success: false,
                error: "Check-out time must be after check-in time"
            });
        }

        // Calculate price by hourly rate
        const hourlyPrice = totalHours * PriceByHour;

        // Calculate price by nightly rate
        // Count the number of nights (calendar days)
        const checkInDate = new Date(bookIn);
        const checkOutDate = new Date(bookOut);
        let nights = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)); // Number of nights, floor to get full days

        // Calculate remaining hours after accounting for full nights
        const checkInHour = parseInt(eta.split(":")[0]) + parseInt(eta.split(":")[1]) / 60;
        const checkOutHour = parseInt(etd.split(":")[0]) + parseInt(etd.split(":")[1]) / 60;
        const checkInDayStart = new Date(checkInDateTime);
        checkInDayStart.setHours(0, 0, 0, 0); // Start of check-in day
        const checkOutDayStart = new Date(checkOutDateTime);
        checkOutDayStart.setHours(0, 0, 0, 0); // Start of check-out day

        // Total hours from check-in to check-out
        let remainingHours = totalHours - (nights * 24);

        // Adjust for partial days
        if (remainingHours > 0) {
            // Calculate the cost of the remaining hours
            const remainingHoursCost = remainingHours * PriceByHour;
            // Compare with the cost of a full night
            if (remainingHoursCost > PriceByNight) {
                // If remaining hours cost more than a night, add a night and set remaining hours to 0
                nights += 1;
                remainingHours = 0;
            }
        } else {
            remainingHours = 0; // Ensure no negative hours
        }

        // Calculate nightly price
        const nightlyPrice = (nights * PriceByNight) + (remainingHours * PriceByHour);

        // Determine the optimal (lowest) price
        const optimalPrice = Math.min(hourlyPrice, nightlyPrice);
        const pricingMethod = hourlyPrice <= nightlyPrice ? "hourly" : "nightly";

        // Return the result
        return res.status(200).json({
            success: true,
            data: {
                bookingId,
                totalHours,
                nights,
                additionalHours: remainingHours,
                hourlyPrice,
                nightlyPrice,
                optimalPrice,
                pricingMethod
            },
            message: "Optimal price calculated successfully"
        });

    } catch (error) {
        console.error("Error calculating optimal price:", {
            error: error.message,
            stack: error.stack,
            bookingId: req.params.bookingId
        });
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { optimalPrice };