const { database } = require("../config/firebaseconfig");
const { ref, set, push, get, child } = require("firebase/database");

const deleteRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;

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

        // ✅ Delete the room
        await set(roomRef, null);

        return res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
