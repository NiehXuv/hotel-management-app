const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

const createIssue = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params; // Get hotelId and roomNumber from URL
        const { description, status } = req.body;

        // Validate required fields
        if (!hotelId || !roomNumber) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID and Room Number are required in the URL"
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                error: "Description is required"
            });
        }

        // Get the current IssueCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/IssueCounter`);
        const counterSnapshot = await get(counterRef);
        let nextId = 1; // Default to 1 if counter doesn't exist

        if (counterSnapshot.exists()) {
            nextId = counterSnapshot.val() + 1;
        }

        // Create the new issue with the numeric ID
        const issueRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Issue/${nextId}`);
        await set(issueRef, {
            Description: description,
            Status:status || "Pending",
            ReportedAt: new Date().toISOString()
        });

        // Update the IssueCounter
        await set(counterRef, nextId);

        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            issueId: nextId.toString() // Return as string to match Firebase key
        });
    } catch (error) {
        console.error("Error creating issue:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { createIssue };