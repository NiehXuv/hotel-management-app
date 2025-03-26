const { database } = require("../config/firebaseconfig");
const { ref, get, set, remove } = require("firebase/database");

const removeEquipment = async (req, res) => {
    try {
        const { hotelId, roomNumber, equipmentId } = req.params;

        if (!hotelId || !roomNumber || !equipmentId) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID, Room Number, and Equipment ID are required"
            });
        }

        // Fetch all Equipment for the room
        const equipmentRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Equipment`);
        const equipmentSnapshot = await get(equipmentRef);

        if (!equipmentSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "No equipment found for this room"
            });
        }

        const equipment = equipmentSnapshot.val();
        if (!equipment[equipmentId]) {
            return res.status(404).json({
                success: false,
                error: "Equipment not found"
            });
        }

        // Remove the specified equipment
        const singleEquipmentRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Equipment/${equipmentId}`);
        await remove(singleEquipmentRef);

        // Get all remaining equipment
        const remainingEquipment = Object.keys(equipment)
            .filter(id => id !== equipmentId)
            .map(id => ({ id: parseInt(id), ...equipment[id] }))
            .sort((a, b) => a.id - b.id); // Sort by ID

        // Reassign IDs sequentially
        const equipmentPath = `Hotel/${hotelId}/Room/${roomNumber}/Equipment`;
        await remove(ref(database, equipmentPath)); // Clear all equipment

        const newEquipment = {};
        for (let i = 0; i < remainingEquipment.length; i++) {
            const newId = (i + 1).toString(); // New ID starts from 1
            newEquipment[newId] = {
                Name: remainingEquipment[i].Name,
                Status: remainingEquipment[i].Status,
                LastChecked: remainingEquipment[i].LastChecked
            };
        }

        // Write back the reassigned equipment
        if (Object.keys(newEquipment).length > 0) {
            await set(ref(database, equipmentPath), newEquipment);
        }

        // Update the EquipmentCounter
        const counterRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/EquipmentCounter`);
        const newCounterValue = remainingEquipment.length; // New highest ID
        await set(counterRef, newCounterValue);

        return res.status(200).json({
            success: true,
            message: "Equipment removed successfully and IDs reassigned"
        });
    } catch (error) {
        console.error("Error removing equipment:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { removeEquipment };