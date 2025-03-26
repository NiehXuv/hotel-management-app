const { database } = require("../config/firebaseconfig");
const { ref, get, set, remove } = require("firebase/database");

const removeIssue = async (req, res) => {
    try {
        const { hotelId, roomNumber, issueId } = req.params;

        if (!hotelId || !roomNumber || !issueId) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID, Room Number, and Issue ID are required"
            });
        }

        // Fetch all Issues for the room
        const issuesRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Issue`);
        const issuesSnapshot = await get(issuesRef);

        if (!issuesSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "No issues found for this room"
            });
        }

        const issues = issuesSnapshot.val();
        if (!issues[issueId]) {
            return res.status(404).json({
                success: false,
                error: "Issue not found"
            });
        }

        // Remove the specified issue
        const issueRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Issue/${issueId}`);
        await remove(issueRef);

        // Get all remaining issues
        const remainingIssues = Object.keys(issues)
            .filter(id => id !== issueId)
            .map(id => ({ id: parseInt(id), ...issues[id] }))
            .sort((a, b) => a.id - b.id); // Sort by ID

        // Reassign IDs sequentially
        const issuesPath = `Hotel/${hotelId}/Room/${roomNumber}/Issue`;
        await remove(ref(database, issuesPath)); // Clear all issues

        const newIssues = {};
        for (let i = 0; i < remainingIssues.length; i++) {
            const newId = (i + 1).toString(); // New ID starts from 1
            newIssues[newId] = {
                Description: remainingIssues[i].Description,
                Status: remainingIssues[i].Status,
                ReportedAt: remainingIssues[i].ReportedAt,
                ...(remainingIssues[i].ResolvedAt && { ResolvedAt: remainingIssues[i].ResolvedAt })
            };
        }

        // Write back the reassigned issues
        if (Object.keys(newIssues).length > 0) {
            await set(ref(database, issuesPath), newIssues);
        }

        // Update the IssueCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/IssueCounter`);
        const newCounterValue = remainingIssues.length; // New highest ID
        await set(counterRef, newCounterValue);

        return res.status(200).json({
            success: true,
            message: "Issue removed successfully and IDs reassigned"
        });
    } catch (error) {
        console.error("Error removing issue:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { removeIssue };