const { database } = require("../config/firebaseconfig");
const { ref, remove } = require("firebase/database");

async function removeCustomer(req, res) {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ error: "Customer ID is required" });
        }

        // Use the correct database instance
        const customerRef = ref(database, `Customer/${customerId}`);

        await remove(customerRef);

        return res.json({ message: "Customer removed successfully" });
    } catch (error) {
        console.error("Error removing customer:", error);
        return res.status(500).json({ error: "Failed to remove customer" });
    }
}

module.exports = { removeCustomer };