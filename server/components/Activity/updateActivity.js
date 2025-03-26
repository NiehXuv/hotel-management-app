const { database } = require("../config/firebaseconfig");
const { ref, update } = require("firebase/database");

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

        const activityRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Activity/${activityId}`);
        const updates = {};
        if (action) updates.Action = action;
        if (details) updates.Details = details;
        if (user) updates.User = user;
        updates.Timestamp = new Date().toISOString();

        await update(activityRef, updates);

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