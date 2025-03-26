const { database } = require("../config/firebaseconfig");
const { ref, update } = require("firebase/database");

const updateEquipment = async (req, res) => {
    try {
        const { hotelId, roomNumber, equipmentId } = req.params;
        const { name, status } = req.body;

        if (!hotelId || !roomNumber || !equipmentId) {
            return res.status(400).json({
                success: false,
                error: "Hotel ID, Room Number, and Equipment ID are required"
            });
        }

        const equipmentRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}/Equipment/${equipmentId}`);
        const updates = {};
        if (name) updates.Name = name;
        if (status) updates.Status = status;
        updates.LastChecked = new Date().toISOString();

        await update(equipmentRef, updates);

        return res.status(200).json({
            success: true,
            message: "Equipment updated successfully"
        });
    } catch (error) {
        console.error("Error updating equipment:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { updateEquipment };