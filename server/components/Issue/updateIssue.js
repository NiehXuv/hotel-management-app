const { database } = require("../config/firebaseconfig");
const { ref, update } = require("firebase/database");
const { addNotification } = require("../Notification/notificationHelper");
const updateIssue = async (req, res) => {
    try {
        const { hotelId, roomNumber, issueId } = req.params;
        const { description, status } = req.body;

        if (!hotelId || !roomNumber || !issueId) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID, Room Number, and Issue ID are required"
            });
        }

        const issueRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Issue/${issueId}`);
        const updates = {};
        if (description) updates.Description = description;
        if (status) updates.Status = status;
        if (status === "Resolved") updates.ResolvedAt = new Date().toISOString();

        await update(issueRef, updates);

        // Add notification
    const message = `Issue updated in Room ${roomNumber}: Status changed to ${status}`;
    await addNotification(hotelId, "Issue", "Updated", message, roomNumber);

        return res.status(200).json({
            success: true,
            message: "Issue updated successfully"
        });
    } catch (error) {
        console.error("Error updating issue:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { updateIssue };