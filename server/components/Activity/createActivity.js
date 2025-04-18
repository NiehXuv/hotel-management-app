const { database } = require("../config/firebaseconfig");
const { ref, get, set, increment, update } = require("firebase/database");
const { addNotification } = require("../Notification/notificationHelper");

const createActivity = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;
        const { action, details, user } = req.body;

        // Validate required fields
        if (!hotelId || !roomNumber) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID and Room Number are required in the URL"
            });
        }

        if (!action) {
            return res.status(400).json({
                success: false,
                error: "Action is required"
            });
        }

        // Check if hotel exists
        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "Hotel not found"
            });
        }

        // Check if room exists
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
        const roomSnapshot = await get(roomRef);
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "Room not found"
            });
        }

        // Atomically increment the ActivityCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/ActivityCounter`);
        const counterSnapshot = await get(counterRef);
        let nextId = 1;

        if (counterSnapshot.exists()) {
            nextId = counterSnapshot.val() + 1;
        }

        // Create the new activity with the numeric ID
        const activityRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Activity/${nextId}`);
        await set(activityRef, {
            Action: action,
            Details: details || "empty",
            User: user || "empty",
            Timestamp: new Date().toISOString()
        });

        // Update the ActivityCounter atomically
        await update(ref(database, `Hotel/${hotelId}/Room/${roomNumber}`), {
            ActivityCounter: nextId,
            UpdatedAt: new Date().toISOString(),
        });

        // Add notification
        const message = `Activity created in Room ${roomNumber}: ${details || "empty"}`;
        await addNotification(hotelId, "Activity", "Created", message, roomNumber, user || "unknown");

        return res.status(201).json({
            success: true,
            message: "Activity created successfully",
            ActivityId: nextId.toString()
        });
    } catch (error) {
        console.error("Error creating activity:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { createActivity };