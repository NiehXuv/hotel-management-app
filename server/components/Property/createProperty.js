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
            }
        }

        let newHotelId = 0;
        if (hotelSnapshot.exists()) {
            newHotelId = Object.keys(hotelSnapshot.val()).length + 1;
        }

        const hotelRef = ref(database, `Hotel/${newHotelId}`);
        await set(hotelRef, {
            name,
            description,
            location,
            email,
            phoneNumber,
        });

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