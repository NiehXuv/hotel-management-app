const { database } = require("../config/firebaseconfig");
const { ref, set, get, runTransaction } = require("firebase/database");

const createProperty = async (req, res) => {
    try{
        const{name, description, location, email, phoneNumber} = req.body;

        if (!name || !description || !location || !email || !phoneNumber) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required' });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name must be at least 2 characters' 
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
                    hotel.name && hotel.location && // Ensure properties exist
                    hotel.name.trim().toLowerCase() === name.trim().toLowerCase() &&
                    hotel.location.trim().toLowerCase() === location.trim().toLowerCase()
                ) {
                    return res.status(400).json({ success: false, error: "Hotel with the same name and location already exists." });
                }
                if (
                    hotel &&
                    hotel.Location &&
                    hotel.Location.trim().toLowerCase() === location.trim().toLowerCase()
                ){
                    return res.status(400).json({
                        success:false,
                        error: "Hotel with the same location already exists"
                    });
                }
            }
        }

        let newHotelId = 0;
        if (hotelSnapshot.exists()) {
            newHotelId = Object.keys(hotelSnapshot.val()).length + 1;
        }

        const hotelRef = ref(database, `Hotel/${newHotelId}`);
        await set(hotelRef, {
            Name: name,
            Description: description,
            Location: location,
            Email: email,
            PhoneNumber: phoneNumber,
<<<<<<< HEAD
        };

        // Log the data before saving
        console.log("Data to be saved to Firebase:", hotelData);

        // Save hotel data to Firebase
        await set(hotelRef, hotelData);

        // Save RoomTypes to Firebase
        const roomTypesRef = ref(database, `Hotel/${newHotelId}/RoomType`);
        const roomTypeData = {};
        validRoomTypes.forEach(type => {
            roomTypeData[type] = true;
        });

        await set(roomTypesRef, roomTypeData);

        // Verify the data was saved by reading it back
        const savedSnapshot = await get(hotelRef);
        if (savedSnapshot.exists()) {
            console.log("Data retrieved from Firebase after save:", savedSnapshot.val());
        } else {
            console.log("No data found at path after save:", `Hotel/${newHotelId}`);
        }
=======
        });
>>>>>>> parent of a2cd3cb (added Roomtype)

        return res.status(201).json({
            success: true,
            data: { hotelId: newHotelId, name },
            message: "Hotel created successfully"
        });
    }
    catch(error){
        console.error("Error creating hotel:", error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

module.exports = { createProperty};