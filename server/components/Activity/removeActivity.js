const { database } = require("../config/firebaseconfig");
const { ref, get, remove, update } = require("firebase/database");
const { addNotification } = require("../Notification/notificationHelper");

const removeActivity = async (req, res) => {
    try {
        const { hotelId, roomNumber, activityId } = req.params;

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

        const activityData = activitySnapshot.val();

        // Remove the activity
        await remove(activityRef);

        // Decrement the ActivityCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/ActivityCounter`);
        const counterSnapshot = await get(counterRef);
        const currentCounter = counterSnapshot.exists() ? counterSnapshot.val() : 0;
        const newCounter = Math.max(0, currentCounter - 1);

        await update(ref(database, `Hotel/${hotelId}/Room/${roomNumber}`), {
            ActivityCounter: newCounter,
            UpdatedAt: new Date().toISOString(),
        });

        // Add notification after successful removal
        const message = `Activity deleted in Room ${roomNumber}`;
        await addNotification(hotelId, "Activity", "Deleted", message, roomNumber, activityData.User || "unknown");

        return res.status(200).json({
            success: true,
            message: "Activity removed successfully"
        });
    } catch (error) {
        console.error("Error removing activity:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { removeActivity };