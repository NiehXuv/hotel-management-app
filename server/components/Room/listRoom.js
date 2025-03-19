const listRoom = async (req, res) => {
    try {
        const { hotelId } = req.params;

        // ✅ Validate hotelId
        if (!hotelId) {
            return res.status(400).json({ error: 'Hotel ID is required' });
        }

        // ✅ Check if the hotel exists
        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);

        if (!hotelSnapshot.exists()) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // ✅ Fetch rooms
        const roomRef = ref(database, `Hotel/${hotelId}/Room`);
        const roomSnapshot = await get(roomRef);

        if (!roomSnapshot.exists()) {
            return res.status(404).json({ error: 'No rooms found for this hotel' });
        }

        return res.status(200).json(roomSnapshot.val());
    } catch (error) {
        console.error('Error listing rooms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
