const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

const getHotelIds = async (req, res) => {
    try {
        const hotelsRef = ref(database, 'Hotel');
        const snapshot = await get(hotelsRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No hotels found'
            });
        }

        const hotels = snapshot.val();
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
            RoomName = '', 
            Description = '', 
            PriceByDay = 0, 
            PriceByNight = 0, 
            PriceBySection = 0, 
            RoomNumber 
        } = req.body;

        if (!hotelId || !RoomNumber || !RoomName || !Description) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required' 
            });
        }

        if (RoomName.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name must be at least 2 characters' 
            });
        }
        if (Description.trim().length < 10) {
            return res.status(400).json({ 
                success: false,
                error: 'Description must be at least 10 characters' 
            });
        }

        if (isNaN(Number(PriceByDay)) || isNaN(Number(PriceByNight)) || isNaN(Number(PriceBySection))) {
            return res.status(400).json({ 
                success: false,
                error: 'Price values must be numeric' 
            });
        }

        const prices = [Number(PriceByDay), Number(PriceByNight), Number(PriceBySection)];
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

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${RoomNumber}`);
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
            return res.status(400).json({ 
                success: false,
                error: 'Room number already exists' 
            });
        }

        await set(roomRef, {
            RoomName: RoomName.trim(),
            Description: Description.trim(),
            PriceByDay: Number(PriceByDay),
            PriceByNight: Number(PriceByNight),
            PriceBySection: Number(PriceBySection),
            Status: 'available',
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        });

        return res.status(201).json({
            success: true,
            data: { roomId: RoomNumber, hotelId },
            message: 'Room created successfully'
        });
    } catch (error) {
        console.error('Error creating room:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.body.RoomNumber
        });
        const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
        return res.status(500).json({ 
            success: false,
            error: errorMessage 
        });
    }
};

module.exports = { createRoom, getHotelIds };