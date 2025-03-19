const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

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

        const hotelsRef = ref (database, 'Hotel');
        const hotelSnapshot = await get(hotelsRef);

        if (hotelSnapshot.exists()) {
            const hotels = hotelSnapshot.val();
            const hotelExists = Object.values(hotels).some(hotel =>
                hotel.Name.toLowerCase() === name.toLowerCase() &&
                hotel.Location.toLowerCase() === location.toLowerCase()
            );

            if (hotelExists) {
                return res.status(400).json({ success: false, error: "Hotel with this name and location already exists" });
            }
        }
        const newHotelRef = push(hotelsRef);
        const hotelId = newHotelRef.key;
        
        await set(newHotelRef,{
            Name: name.trim(),
            Description: description.trim(),
            Location: location.trim(),
            Email: email.trim(),
            PhoneNumber: phoneNumber.trim(),
        });
        return res.status(200).json({ success: true,
            data: {hotelId, name},
             message: 'Hotel created successfully' });
    }
    catch(error){
        console.error('Error creating hotel:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.body.roomNumber
        });
    }
}

module.exports = { createProperty};