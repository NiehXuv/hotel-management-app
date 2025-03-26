const { database } = require("../config/firebaseconfig");
const { ref, get, set, update } = require("firebase/database");

const createActivity = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params; // Get hotelId and roomNumber from URL
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

        // Get the current ActivityCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/ActivityCounter`);
        const counterSnapshot = await get(counterRef);
        let nextId = 1; // Default to 1 if counter doesn't exist

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

        // Update the ActivityCounter
        await set(counterRef, nextId);

        return res.status(201).json({
            success: true,
            message: "Activity created successfully",
            activityId: nextId.toString() // Return as string to match Firebase key
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