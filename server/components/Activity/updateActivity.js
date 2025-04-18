const { database } = require("../config/firebaseconfig");
const { ref, get, update } = require("firebase/database");
const { addNotification } = require("../Notification/notificationHelper");

const updateActivity = async (req, res) => {
    try {
        const { hotelId, roomNumber, activityId } = req.params;
        const { action, details, user } = req.body;

        if (!hotelId || !roomNumber || !activityId) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID, Room Number, and Activity ID are required"
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

        // Check if activity exists
        const activityRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Activity/${activityId}`);
        const activitySnapshot = await get(activityRef);
        if (!activitySnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "Activity not found"
            });
        }

        const updates = {};
        if (action) updates.Action = action;
        if (details) updates.Details = details;
        if (user) updates.User = user;
        updates.Timestamp = new Date().toISOString();

        await update(activityRef, updates);

        // Add notification
        const message = `Activity updated in Room ${roomNumber}`;
        await addNotification(hotelId, "Activity", "Updated", message, roomNumber, user || "unknown");

        return res.status(200).json({
            success: true,
            message: "Activity updated successfully"
        });
    } catch (error) {
        console.error("Error updating activity:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { updateActivity };