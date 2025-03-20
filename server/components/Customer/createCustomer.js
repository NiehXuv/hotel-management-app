const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

async function createCustomer(req, res) {
    try {
        const {
            Email = "", // Default to empty string
            FirstName,  // Match the case used in the frontend
            LastName = "Unknown", // Default to "Unknown" if not provided
            PhoneNumber = "", // Default to empty string
            Note = "" // Default to empty string
        } = req.body;

        // Validate only FirstName as required
        if (!FirstName || typeof FirstName !== "string" || FirstName.trim() === "") {
            return res.status(400).json({ error: "FirstName is required and must be a non-empty string" });
        }

        console.log("Customers path:", "Customer");
        const customersRef = ref(database, 'Customer');
        const customersSnap = await get(customersRef);

        let customerId = FirstName.toLowerCase(); // Convert to lowercase for consistency
        let count = 1;

        if (customersSnap.exists()) {
            const existingCustomers = customersSnap.val();
            while (existingCustomers[customerId]) {
                customerId = `${FirstName.toLowerCase()}${count}`;
                count++;
            }
        }

        const customerData = {
            Email,
            FirstName,
            LastName,
            PhoneNumber,
            Note
        };

        console.log("New customer path:", `Customer/${customerId}`);
        const customerRef = ref(database, `Customer/${customerId}`);
        await set(customerRef, customerData);

        return res.status(201).json({ message: "Customer created successfully", customerId });

    } catch (error) {
        console.error("Error creating customer:", error);
        return res.status(500).json({ error: "Failed to create customer" });
    }
}

module.exports = { createCustomer };