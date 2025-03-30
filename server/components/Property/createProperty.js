// backend/createProperty.js
const { database } = require("../config/firebaseconfig");
const { ref, set, get, runTransaction } = require("firebase/database");

const createProperty = async (req, res) => {
    try {
        const { name, description, location, email, phoneNumber, roomTypes } = req.body;

        // Log the incoming request body
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
                error: 'At least one RoomType is required' 
            });
        }
        
        if (name.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name must be at least 2 characters' 
            });
        }

        // Validate roomTypes
        const validRoomTypes = roomTypes.filter(type => typeof type === 'string' && type.trim() !== '');
        if (validRoomTypes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one valid RoomType is required'
            });
        }

        const hotelsRef = ref(database, 'Hotel');
        const hotelSnapshot = await get(hotelsRef);

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
                        error: "Hotel with the same name and location already exists." 
                    });
                }
            }
        }

        let newHotelId = 0;
        if (hotelSnapshot.exists()) {
            newHotelId = Object.keys(hotelSnapshot.val()).length + 1;
        }

        const hotelRef = ref(database, `Hotel/${newHotelId}`);
        const hotelData = {
            Name: name,
            Description: description,
            Location: location,
            Email: email,
            PhoneNumber: phoneNumber,
            RoomTypes: validRoomTypes // Explicitly include RoomTypes
        };

        // Log the data before saving
        console.log("Data to be saved to Firebase:", hotelData);

        // Save to Firebase
        await set(hotelRef, hotelData);

        // Verify the data was saved by reading it back
        const savedSnapshot = await get(hotelRef);
        if (savedSnapshot.exists()) {
            console.log("Data retrieved from Firebase after save:", savedSnapshot.val());
        } else {
            console.log("No data found at path after save:", `Hotel/${newHotelId}`);
        }

        return res.status(201).json({
            success: true,
            data: { hotelId: newHotelId, name, roomTypes: validRoomTypes },
            message: "Hotel created successfully"
        });
    } catch (error) {
        console.error("Error creating hotel:", error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { createProperty };