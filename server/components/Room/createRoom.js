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

const getRoomTypes = async (req, res) => {
    try {
        const { hotelId } = req.params;

        if (!hotelId) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID is required'
            });
        }

        const roomTypesRef = ref(database, `Hotel/${hotelId}/RoomTypes`);
        const snapshot = await get(roomTypesRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No room types found for this hotel'
            });
        }

        const roomTypes = snapshot.val();
        const roomTypeList = Object.values(roomTypes).map(roomType => ({
            type: roomType.Type,
            priceByHour: roomType.PriceByHour,
            priceBySection: roomType.PriceBySection,
            priceByNight: roomType.PriceByNight
        }));

        return res.status(200).json({
            success: true,
            data: roomTypeList,
            message: 'Room types retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching room types:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId
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
            RoomType = '', 
            RoomName = '', 
            Description = '', 
            PriceByHour = 0, 
            PriceByNight = 0, 
            PriceBySection = 0, 
            RoomNumber 
        } = req.body;

        // Validation
        if (!hotelId || !RoomNumber || !RoomType || !RoomName || !Description) {
            return res.status(400).json({ 
                success: false,
                error: 'Hotel ID, Room Number, Room Type, Room Name, and Description are required' 
            });
        }

        if (RoomType.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Room Type must be at least 2 characters' 
            });
        }
        if (RoomName.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Room Name must be at least 2 characters' 
            });
        }
        if (Description.trim().length < 10) {
            return res.status(400).json({ 
                success: false,
                error: 'Description must be at least 10 characters' 
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

        // Check if RoomType exists in Hotel's RoomTypes and get prices
        const roomTypesRef = ref(database, `Hotel/${hotelId}/RoomTypes`);
        const roomTypesSnapshot = await get(roomTypesRef);
        let matchedRoomType = null;
        if (roomTypesSnapshot.exists()) {
            const roomTypes = roomTypesSnapshot.val();
            matchedRoomType = Object.values(roomTypes).find(rt => rt.Type === RoomType.trim());
        }

        if (!matchedRoomType) {
            return res.status(400).json({
                success: false,
                error: `Room Type '${RoomType}' not found in hotel's RoomTypes`
            });
        }

        // Use prices from RoomTypes if not provided in request body
        const finalPriceByHour = PriceByHour !== 0 ? Number(PriceByHour) : matchedRoomType.PriceByHour;
        const finalPriceByNight = PriceByNight !== 0 ? Number(PriceByNight) : matchedRoomType.PriceByNight;
        const finalPriceBySection = PriceBySection !== 0 ? Number(PriceBySection) : matchedRoomType.PriceBySection;

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${RoomNumber}`);
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
            return res.status(400).json({ 
                success: false,
                error: 'Room number already exists' 
            });
        }

        // Store RoomNumber as a field in the room data, matching the roomId
        await set(roomRef, {
            RoomType: RoomType.trim(),
            RoomName: RoomName.trim(),
            Description: Description.trim(),
            PriceByHour: finalPriceByHour,
            PriceByNight: finalPriceByNight,
            PriceBySection: finalPriceBySection,
            RoomNumber: RoomNumber.trim(), // Explicitly store RoomNumber as a field
            Status: 'Available',
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

module.exports = { createRoom, getHotelIds, getRoomTypes };