const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

const createEquipment = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params; // Get hotelId and roomNumber from URL
        const { name, status } = req.body;

        // Validate required fields
        if (!hotelId || !roomNumber) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID and Room Number are required in the URL"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                error: "Name is required"
            });
        }

        // Get the current EquipmentCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/EquipmentCounter`);
        const counterSnapshot = await get(counterRef);
        let nextId = 1; // Default to 1 if counter doesn't exist

        if (counterSnapshot.exists()) {
            nextId = counterSnapshot.val() + 1;
        }

        // Create the new equipment with the numeric ID
        const equipmentRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Equipment/${nextId}`);
        await set(equipmentRef, {
            Name: name,
            Status: status || "empty",
            LastChecked: new Date().toISOString()
        });

        // Update the EquipmentCounter
        await set(counterRef, nextId);

        return res.status(201).json({
            success: true,
            message: "Equipment created successfully",
            equipmentId: nextId.toString() // Return as string to match Firebase key
        });
    } catch (error) {
        console.error("Error creating equipment:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { createEquipment };