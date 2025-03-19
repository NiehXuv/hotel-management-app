const { database } = require("../config/firebaseconfig");
const { ref, set, push, get, child } = require("firebase/database");

const createRoom = async (req, res) => {
    try {
        const { hotelId } = req.params; 
        const { name, description, pricebyDay, pricebyNight, pricebySection, roomNumber } = req.body;

        // ✅ Validate input
        if (!hotelId || !name || !description || !pricebyDay || !pricebyNight || !pricebySection || !roomNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // ✅ Check if the hotelId exists in the "Hotel" table
        const hotelRef = ref(database, `Hotel/${hotelId}`); // Ensure "Hotel" is the correct table name
        const hotelSnapshot = await get(hotelRef);

        if (!hotelSnapshot.exists()) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // ✅ Use roomNumber as the key instead of a generated ID
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);

        // ✅ Save to Realtime Database
        await set(roomRef, {
            name,
            description,
            pricebyDay: Number(pricebyDay),
            pricebyNight: Number(pricebyNight),
            pricebySection: Number(pricebySection),
            createdAt: new Date().toISOString(),
        });

        return res.status(201).json({ message: 'Room created successfully', roomId: roomNumber });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { createRoom };
