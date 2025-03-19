const { database } = require("../config/firebaseconfig");
const { ref, set, push, get, child } = require("firebase/database");


const updateRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;
        const { name, description, pricebyDay, pricebyNight, pricebySection } = req.body;

        // ✅ Validate input
        if (!hotelId || !roomNumber) {
            return res.status(400).json({ error: 'Hotel ID and Room Number are required' });
        }

        // ✅ Check if the room exists
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
        const roomSnapshot = await get(roomRef);

        if (!roomSnapshot.exists()) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // ✅ Update room data
        await set(roomRef, {
            ...roomSnapshot.val(), // Keep existing values
            name: name || roomSnapshot.val().name,
            description: description || roomSnapshot.val().description,
            pricebyDay: pricebyDay ? Number(pricebyDay) : roomSnapshot.val().pricebyDay,
            pricebyNight: pricebyNight ? Number(pricebyNight) : roomSnapshot.val().pricebyNight,
            pricebySection: pricebySection ? Number(pricebySection) : roomSnapshot.val().pricebySection,
            updatedAt: new Date().toISOString(),
        });

        return res.status(200).json({ message: 'Room updated successfully' });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
