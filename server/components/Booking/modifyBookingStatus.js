const { database } = require("../config/firebaseconfig");
const { ref, update, get } = require("firebase/database");

const modifyBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params; // Get bookingId from URL params
        const { status } = req.body; // Get new status from request body

        // Validate input
        if (!bookingId || typeof bookingId !== "string") {
            return res.status(400).json({ message: "Invalid or missing bookingId" });
        }
        if (!status || typeof status !== "string") {
            return res.status(400).json({ message: "Invalid or missing status" });
        }

        // Validate status value (optional: restrict to allowed values)
        const allowedStatuses = ["Pending", "Confirmed", "Cancelled", "CheckedIn", "CheckedOut"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}` });
        }

        const bookingRef = ref(database, `Booking/${bookingId}`);
        const bookingSnap = await get(bookingRef);
        if (!bookingSnap.exists()) {
            console.log(`Booking not found for bookingId: ${bookingId}`);
            return res.status(404).json({ message: `Booking not found for bookingId: ${bookingId}` });
        }

        const bookingData = bookingSnap.val();
        const { hotelId, roomId } = bookingData;

       // If setting to CheckedIn, check if room is already Occupied
       if (status === "CheckedIn") {
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomId}`);
        const roomSnap = await get(roomRef);
        if (!roomSnap.exists()) {
            console.log(`Room not found for hotelId: ${hotelId}, roomId: ${roomId}`);
            return res.status(400).json({ message: `Room not found for hotelId: ${hotelId}, roomId: ${roomId}` });
        }

        const roomData = roomSnap.val();
        if (roomData.Status === "Occupied") {
            console.log(`Room ${roomId} is already Occupied for booking ${bookingId}`);
            return res.status(400).json({ message: "This Room Is Already Occupied" });
        }

        // Update room to Occupied
        await update(roomRef, { Status: "Occupied" });
        console.log(`Updated room ${roomId} to Occupied for booking ${bookingId}`);
    }

    // If setting to CheckedOut, reset room to Available
    if (status === "CheckedOut") {
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomId}`);
        const roomSnap = await get(roomRef);
        if (roomSnap.exists()) {
            await update(roomRef, { Status: "Available" });
            console.log(`Updated room ${roomId} to Available for booking ${bookingId}`);
        }
    }

    // Update booking status
    await update(bookingRef, { bookingStatus: status });

        // Return success response
        res.status(200).json({ message: "Booking status updated successfully", bookingId, newStatus: status });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Error updating booking status", error: error.message });
    }
};

module.exports = { modifyBookingStatus };