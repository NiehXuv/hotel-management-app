const { database } = require('../config/firebaseconfig');
const { ref, get } = require('firebase/database');

const listRooms = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { 
            name, 
            status, 
            pricebyDay, 
            pricebyNight, 
            pricebySection 
        } = req.query;

        if (!hotelId) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID is required'
            });
        }

        const roomsRef = ref(database, `Hotel/${hotelId}/Room`);
        const snapshot = await get(roomsRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                roomCount: 0,
                occupiedCount: 0,
                message: 'No rooms found for this hotel'
            });
        }

        const roomsData = snapshot.val();
        let roomsList = Object.entries(roomsData).map(([roomNumber, data]) => ({
            id: roomNumber,
            roomNumber,
            ...data
        }));

        if (name || status || pricebyDay || pricebyNight || pricebySection) {
            roomsList = roomsList.filter(room => {
                let matches = true;
                if (name && room.name && room.name.toLowerCase().indexOf(name.toLowerCase()) === -1) matches = false;
                if (status && room.status !== status) matches = false;
                if (pricebyDay && room.pricebyDay !== Number(pricebyDay)) matches = false;
                if (pricebyNight && room.pricebyNight !== Number(pricebyNight)) matches = false;
                if (pricebySection && room.pricebySection !== Number(pricebySection)) matches = false;
                return matches;
            });
        }

        // Calculate roomCount and occupiedCount
        const roomCount = roomsList.length;
        const occupiedCount = roomsList.filter(room => room.Status === 'Occupied').length;

        return res.status(200).json({
            success: true,
            data: roomsList,
            roomCount,
            occupiedCount,
            message: 'Rooms retrieved successfully'
        });

    } catch (error) {
        console.error('Error listing rooms:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId
        });
        const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

module.exports = { listRooms };