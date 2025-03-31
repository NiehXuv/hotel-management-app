const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

const createProperty = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            location, 
            email, 
            phoneNumber, 
            roomTypes, 
            ...otherFields 
        } = req.body;

        console.log("Request body:", req.body);

        // Validation
        if (!name || !description || !location || !email || !phoneNumber) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields (name, description, location, email, phoneNumber) are required' 
            });
        }

        if (!roomTypes || !Array.isArray(roomTypes) || roomTypes.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'At least one room type is required' 
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name must be at least 2 characters' 
            });
        }

        // Updated roomTypes validation with price fields
        const validRoomTypes = roomTypes.filter(room => 
            room && 
            typeof room.Type === 'string' && 
            room.Type.trim() !== '' &&
            typeof room.PriceByHour === 'number' && room.PriceByHour >= 0 &&
            typeof room.PriceBySection === 'number' && room.PriceBySection >= 0 &&
            typeof room.PriceByNight === 'number' && room.PriceByNight >= 0
        );

        if (validRoomTypes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one valid room type with Type and pricing (PriceByHour, PriceBySection, PriceByNight) is required'
            });
        }

        // Email and phone number validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, error: 'Invalid phone number format' });
        }

        // Check for existing hotel and generate ID
        const hotelsRef = ref(database, 'Hotel');
        const hotelSnapshot = await get(hotelsRef);

        let newHotelId = 0;
        if (hotelSnapshot.exists()) {
            const hotels = hotelSnapshot.val();
            for (const id in hotels) {
                const hotel = hotels[id];
                if (
                    hotel &&
                    hotel.Name && hotel.Location &&
                    hotel.Name.trim().toLowerCase() === name.trim().toLowerCase() &&
                    hotel.Location.trim().toLowerCase() === location.trim().toLowerCase()
                ) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Hotel with the same name and location already exists' 
                    });
                }
            }
            newHotelId = Object.keys(hotels).length + 1;
        } else {
            newHotelId = 1;
        }

        const hotelRef = ref(database, `Hotel/${newHotelId}`);

        // Prepare hotel data
        const hotelData = {
            Name: name,
            Description: description,
            Location: location,
            Email: email,
            PhoneNumber: phoneNumber,
            RoomTypes: {}, // Initialize RoomTypes as an empty object
            ...otherFields
        };

        // Save hotel data
        await set(hotelRef, hotelData);

        // Save room types with pricing as a subcollection
        const roomTypesRef = ref(database, `Hotel/${newHotelId}/RoomTypes`);
        const roomTypesData = validRoomTypes.reduce((acc, room, index) => ({
            ...acc,
            [index]: {
                Type: room.Type.trim(),
                PriceByHour: room.PriceByHour,
                PriceBySection: room.PriceBySection,
                PriceByNight: room.PriceByNight
            }
        }), {});

        await set(roomTypesRef, roomTypesData);

        // Verify the save
        const savedSnapshot = await get(hotelRef);
        if (!savedSnapshot.exists()) {
            throw new Error('Failed to verify saved data');
        }
        console.log("Data retrieved from Firebase after save:", savedSnapshot.val());

        return res.status(201).json({
            success: true,
            data: { 
                hotelId: newHotelId, 
                name, 
                description,
                location,
                email,
                phoneNumber,
                roomTypes: validRoomTypes 
            },
            message: 'Hotel created successfully'
        });
    } catch (error) {
        console.error("Error creating hotel:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal Server Error' 
        });
    }
};

module.exports = { createProperty };