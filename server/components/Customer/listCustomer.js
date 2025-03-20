const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

async function listAllCustomers(req, res) {
    try {
        console.log("Fetching customers from database...");

        // Use the correct database instance
        const customersRef = ref(database, 'Customer');
        const snapshot = await get(customersRef);

        if (snapshot.exists()) {
            console.log("Customers found:", snapshot.val());
            return res.json(snapshot.val());
        } else {
            console.log("No customers found in the database.");
            return res.json([]);
        }
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ error: "Failed to fetch customers" });
    }
}

module.exports = { listAllCustomers };