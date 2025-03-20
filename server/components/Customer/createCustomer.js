const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

async function createCustomer(req, res) {
    try {
        const {
            email = "", // Default to empty string
            firstName,
            lastName = "Unknown", // Default to "Unknown" if not provided
            phoneNumber = "", // Default to empty string
            note = "" // Default to empty string
        } = req.body;

        // Validate only firstName as required
        if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
            return res.status(400).json({ error: "FirstName is required and must be a non-empty string" });
        }

        console.log("Customers path:", "Customer");
        const customersRef = ref(database, 'Customer');
        const customersSnap = await get(customersRef);

        let customerId = firstName.toLowerCase(); // Convert to lowercase for consistency
        let count = 1;

        if (customersSnap.exists()) {
            const existingCustomers = customersSnap.val();
            while (existingCustomers[customerId]) {
                customerId = `${firstName.toLowerCase()}${count}`;
                count++;
            }
        }

        const customerData = {
            Email: email,
            FirstName: firstName,
            LastName: lastName,
            PhoneNumber: phoneNumber,
            Note: note
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