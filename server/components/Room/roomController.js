// roomController.js
const { database } = require("../config/firebaseconfig");
const { ref, set, get, remove, update } = require("firebase/database");

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
            name: data.Name || `Hotel ${id}` // Already using 'Name'
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

        // Get current RoomCounter
        const hotelData = hotelSnapshot.val();
        const currentRoomCounter = hotelData.RoomCounter || 0;

        // Update RoomCounter and create room atomically
        await Promise.all([
            set(roomRef, {
                Name: name.trim(), // Changed to 'Name'
                Description: description.trim(), // Changed to 'Description'
                PricebyDay: Number(pricebyDay), // Changed to 'PricebyDay'
                PricebyNight: Number(pricebyNight), // Changed to 'PricebyNight'
                PricebySection: Number(pricebySection), // Changed to 'PricebySection'
                Status: 'available', // Changed to 'Status'
                CreatedAt: new Date().toISOString(), // Changed to 'CreatedAt'
                UpdatedAt: new Date().toISOString() // Changed to 'UpdatedAt'
            }),
            update(ref(database, `Hotel/${hotelId}`), {
                RoomCounter: currentRoomCounter + 1
            })
        ]);

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

// List all rooms for a specific hotel
const listRoom = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const roomsRef = ref(database, `Hotel/${hotelId}/Room`);
        const roomsSnapshot = await get(roomsRef);

        if (!roomsSnapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No rooms found for this hotel'
            });
        }

        const rooms = roomsSnapshot.val();
        const roomList = Object.entries(rooms).map(([roomNumber, data]) => ({
            roomNumber,
            Name: data.Name, // Changed to 'Name'
            Description: data.Description, // Changed to 'Description'
            PricebyDay: data.PricebyDay, // Changed to 'PricebyDay'
            PricebyNight: data.PricebyNight, // Changed to 'PricebyNight'
            PricebySection: data.PricebySection, // Changed to 'PricebySection'
            Status: data.Status, // Changed to 'Status'
            CreatedAt: data.CreatedAt, // Changed to 'CreatedAt'
            UpdatedAt: data.UpdatedAt // Changed to 'UpdatedAt'
        }));

        return res.status(200).json({
            success: true,
            data: roomList,
            message: 'Rooms retrieved successfully'
        });
    } catch (error) {
        console.error('Error listing rooms:', {
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

// List available rooms for a specific hotel
const listAvailableRoom = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const roomsRef = ref(database, `Hotel/${hotelId}/Room`);
        const roomsSnapshot = await get(roomsRef);

        if (!roomsSnapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No rooms found for this hotel'
            });
        }

        const rooms = roomsSnapshot.val();
        const availableRooms = Object.entries(rooms)
            .filter(([_, data]) => data.Status === 'available') // Changed to 'Status'
            .map(([roomNumber, data]) => ({
                roomNumber,
                Name: data.Name, // Changed to 'Name'
                Description: data.Description, // Changed to 'Description'
                PricebyDay: data.PricebyDay, // Changed to 'PricebyDay'
                PricebyNight: data.PricebyNight, // Changed to 'PricebyNight'
                PricebySection: data.PricebySection, // Changed to 'PricebySection'
                Status: data.Status, // Changed to 'Status'
                CreatedAt: data.CreatedAt, // Changed to 'CreatedAt'
                UpdatedAt: data.UpdatedAt // Changed to 'UpdatedAt'
            }));

        return res.status(200).json({
            success: true,
            data: availableRooms,
            message: 'Available rooms retrieved successfully'
        });
    } catch (error) {
        console.error('Error listing available rooms:', {
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

// Delete a room
const deleteRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;

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
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Get current RoomCounter
        const hotelData = hotelSnapshot.val();
        const currentRoomCounter = hotelData.RoomCounter || 0;

        // Ensure RoomCounter doesn't go below 0
        const newRoomCounter = Math.max(0, currentRoomCounter - 1);

        // Update RoomCounter and delete room atomically
        await Promise.all([
            remove(roomRef),
            update(ref(database, `Hotel/${hotelId}`), {
                RoomCounter: newRoomCounter
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting room:', {
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

// Update a room
const updateRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;
        const { 
            name, 
            description, 
            pricebyDay, 
            pricebyNight, 
            pricebySection, 
            status 
        } = req.body;

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
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Validate updated fields if provided
        if (name && name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Name must be at least 2 characters'
            });
        }
        if (description && description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Description must be at least 10 characters'
            });
        }
        if (pricebyDay !== undefined && (isNaN(Number(pricebyDay)) || Number(pricebyDay) < 0)) {
            return res.status(400).json({
                success: false,
                error: 'Price by day must be a non-negative number'
            });
        }
        if (pricebyNight !== undefined && (isNaN(Number(pricebyNight)) || Number(pricebyNight) < 0)) {
            return res.status(400).json({
                success: false,
                error: 'Price by night must be a non-negative number'
            });
        }
        if (pricebySection !== undefined && (isNaN(Number(pricebySection)) || Number(pricebySection) < 0)) {
            return res.status(400).json({
                success: false,
                error: 'Price by section must be a non-negative number'
            });
        }
        if (status && !['available', 'booked'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either "available" or "booked"'
            });
        }

        const updates = {};
        if (name) updates.Name = name.trim(); // Changed to 'Name'
        if (description) updates.Description = description.trim(); // Changed to 'Description'
        if (pricebyDay !== undefined) updates.PricebyDay = Number(pricebyDay); // Changed to 'PricebyDay'
        if (pricebyNight !== undefined) updates.PricebyNight = Number(pricebyNight); // Changed to 'PricebyNight'
        if (pricebySection !== undefined) updates.PricebySection = Number(pricebySection); // Changed to 'PricebySection'
        if (status) updates.Status = status; // Changed to 'Status'
        updates.UpdatedAt = new Date().toISOString(); // Changed to 'UpdatedAt'

        await update(roomRef, updates);

        return res.status(200).json({
            success: true,
            data: { hotelId, roomNumber },
            message: 'Room updated successfully'
        });
    } catch (error) {
        console.error('Error updating room:', {
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

module.exports = { createRoom, getHotelIds, listRoom, listAvailableRoom, deleteRoom, updateRoom };