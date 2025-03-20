const { database } = require("../config/firebaseconfig");
const { ref, update } = require("firebase/database");

async function updateCustomer(req, res) {
    try {
        const { customerId } = req.params;
        const updates = req.body;

        if (!customerId) {
            return res.status(400).json({ error: "Customer ID is required" });
        }

        if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "Updates are required and must be a non-empty object" });
        }

        // Use the correct database instance
        const customerRef = ref(database, `Customer/${customerId}`);

        await update(customerRef, updates);

        return res.json({ message: "Customer updated successfully" });
    } catch (error) {
        console.error("Error updating customer:", error);
        return res.status(500).json({ error: "Failed to update customer" });
    }
}

module.exports = { updateCustomer };