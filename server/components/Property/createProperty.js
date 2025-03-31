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

        // Validation for basic fields
        if (!name || !description || !location || !email || !phoneNumber) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields (name, description, location, email, phoneNumber) are required' 
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name must be at least 2 characters' 
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

        // Prepare roomTypes data with specified fields, no validation
        const formattedRoomTypes = Array.isArray(roomTypes) ? roomTypes.map((room, index) => ({
            Type: room.Type || '', // Default to empty string if not provided
            PriceByHour: room.PriceByHour || 0, // Default to 0 if not provided
            PriceBySection: room.PriceBySection || 0, // Default to 0 if not provided
            PriceByNight: room.PriceByNight || 0 // Default to 0 if not provided
        })) : [];

        // Prepare hotel data with roomTypes included
        const hotelData = {
            Name: name,
            Description: description,
            Location: location,
            Email: email,
            PhoneNumber: phoneNumber,
            RoomTypes: formattedRoomTypes, // Use formatted roomTypes
            ...otherFields
        };

        // Save hotel data
        await set(hotelRef, hotelData);

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
                roomTypes: formattedRoomTypes // Return formatted roomTypes
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