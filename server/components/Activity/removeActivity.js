const { database } = require("../config/firebaseconfig");
const { ref, get, set, remove } = require("firebase/database");

const removeActivity = async (req, res) => {
    try {
        const { hotelId, roomNumber, activityId } = req.params;

        if (!hotelId || !roomNumber || !activityId) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID, Room Number, and Activity ID are required"
            });
        }

        // Fetch all Activities for the room
        const activitiesRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Activity`);
        const activitiesSnapshot = await get(activitiesRef);

        if (!activitiesSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "No activities found for this room"
            });
        }

        const activities = activitiesSnapshot.val();
        if (!activities[activityId]) {
            return res.status(404).json({
                success: false,
                error: "Activity not found"
            });
        }

        // Remove the specified activity
        const activityRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Activity/${activityId}`);
        await remove(activityRef);

        // Get all remaining activities
        const remainingActivities = Object.keys(activities)
            .filter(id => id !== activityId)
            .map(id => ({ id: parseInt(id), ...activities[id] }))
            .sort((a, b) => a.id - b.id); // Sort by ID

        // Reassign IDs sequentially
        const activitiesPath = `Hotel/${hotelId}/Room/${roomNumber}/Activity`;
        await remove(ref(database, activitiesPath)); // Clear all activities

        const newActivities = {};
        for (let i = 0; i < remainingActivities.length; i++) {
            const newId = (i + 1).toString(); // New ID starts from 1
            newActivities[newId] = {
                Action: remainingActivities[i].Action,
                Details: remainingActivities[i].Details,
                User: remainingActivities[i].User,
                Timestamp: remainingActivities[i].Timestamp
            };
        }

        // Write back the reassigned activities
        if (Object.keys(newActivities).length > 0) {
            await set(ref(database, activitiesPath), newActivities);
        }

        // Update the ActivityCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/ActivityCounter`);
        const newCounterValue = remainingActivities.length; // New highest ID
        await set(counterRef, newCounterValue);

        return res.status(200).json({
            success: true,
            message: "Activity removed successfully and IDs reassigned"
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