const { database } = require("../config/firebaseconfig");
const { ref, get, update } = require("firebase/database");

const updateRoomStatus = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;
        const { status } = req.body;

        const validStatuses = ['Available', 'Occupied']; // Updated to match frontend options
        
        if (!hotelId || !roomNumber) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID and Room Number are required'
            });
        }

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either "Available" or "Occupied"' // Updated error message
            });
        }

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
        const roomSnapshot = await get(roomRef);
        
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        await update(roomRef, {
            Status: status, // Capitalized to match database convention
            UpdatedAt: new Date().toISOString() // Capitalized to match other fields
        });

        return res.status(200).json({
            success: true,
            data: { hotelId, roomNumber, Status: status }, // Capitalized in response
            message: 'Room status updated successfully'
        });

    } catch (error) {
        console.error('Error updating room status:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.params.roomNumber
        });
        const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

module.exports = { updateRoomStatus };