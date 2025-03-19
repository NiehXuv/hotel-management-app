// roomController.js
const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

const getHotelIds = async (req, res) => {
    try {
        const hotelsRef = ref(database, 'Hotel'); // Matches your table name
        const snapshot = await get(hotelsRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No hotels found'
            });
        }

        const hotels = snapshot.val();
        // Assuming Hotel entries have a 'name' field; adjust if different
        const hotelList = Object.entries(hotels).map(([id, data]) => ({
            id,
            name: data.Name || `Hotel ${id}`
        }));

        return res.status(200).json({
            success: true,
            data: hotelList,
            message: 'Hotel IDs retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching hotel IDs:', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

const createRoom = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { 
            name = '', 
            description = '', 
            pricebyDay = 0, 
            pricebyNight = 0, 
            pricebySection = 0, 
            roomNumber 
        } = req.body;

        if (!hotelId || !roomNumber || !name || !description) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required' 
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name must be at least 2 characters' 
            });
        }
        if (description.trim().length < 10) {
            return res.status(400).json({ 
                success: false,
                error: 'Description must be at least 10 characters' 
            });
        }

        if (isNaN(Number(pricebyDay)) || isNaN(Number(pricebyNight)) || isNaN(Number(pricebySection))) {
            return res.status(400).json({ 
                success: false,
                error: 'Price values must be numeric' 
            });
        }

        const prices = [Number(pricebyDay), Number(pricebyNight), Number(pricebySection)];
        if (prices.some(price => price < 0)) {
            return res.status(400).json({ 
                success: false,
                error: 'Prices cannot be negative' 
            });
        }

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({ 
                success: false,
                error: 'Hotel not found' 
            });
        }

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
            return res.status(400).json({ 
                success: false,
                error: 'Room number already exists' 
            });
        }

        await set(roomRef, {
            name: name.trim(),
            description: description.trim(),
            pricebyDay: Number(pricebyDay),
            pricebyNight: Number(pricebyNight),
            pricebySection: Number(pricebySection),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return res.status(201).json({
            success: true,
            data: { roomId: roomNumber, hotelId },
            message: 'Room created successfully'
        });
    } catch (error) {
        console.error('Error creating room:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.body.roomNumber
        });
        const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
        return res.status(500).json({ 
            success: false,
            error: errorMessage 
        });
    }
};

module.exports = { createRoom, getHotelIds };