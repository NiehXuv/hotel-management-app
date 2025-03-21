// deleteRoom.js
const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

const deleteRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;

        // Validate required parameters
        if (!hotelId || !roomNumber) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID and Room Number are required'
            });
        }

        // Check if hotel exists
        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        // Check if room exists
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
        const roomSnapshot = await get(roomRef);
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Delete the room by setting it to null
        await set(roomRef, null);

        return res.status(200).json({
            success: true,
            data: { hotelId, roomNumber },
            message: 'Room deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting room:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.params.roomNumber
        });
        
        const errorMessage = error.code === 'PERMISSION_DENIED' 
            ? 'Permission denied' 
            : 'Internal Server Error';
        
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

module.exports = { deleteRoom };