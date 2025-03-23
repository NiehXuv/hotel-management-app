const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

const deleteProperty = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { requesterId } = req.body;

        // Validate requester ID
        if (!requesterId) {
            return res.status(400).json({ error: "Staff ID is required" });
        }

        // Check if requester is a manager
        const requesterRef = ref(database, `Staff/${requesterId}`);
        const requesterSnap = await get(requesterRef);
        if (!requesterSnap.exists() || requesterSnap.val().Role.toLowerCase() !== "manager") {
            return res.status(403).json({ error: "Unauthorized: Only managers can remove hotels." });
        }

        // Validate hotelId
        const idToDelete = parseInt(hotelId);
        if (isNaN(idToDelete) || idToDelete <= 0) {
            return res.status(400).json({ error: "Invalid hotel ID" });
        }

        // Fetch all hotels
        const hotelsRef = ref(database, "Hotel");
        const hotelsSnap = await get(hotelsRef);

        if (!hotelsSnap.exists()) {
            return res.status(404).json({ error: "No hotels found" });
        }

        const hotels = hotelsSnap.val();

        // Check if hotel exists
        if (!hotels[idToDelete]) {
            return res.status(404).json({ error: `Hotel with ID ${idToDelete} not found` });
        }

        // Delete the hotel
        delete hotels[idToDelete];

        // Reassign hotel IDs
        const remainingHotels = Object.values(hotels); // Convert to array to reset index
        const newHotels = {};

        remainingHotels.forEach((hotel, index) => {
            newHotels[(index + 1).toString()] = hotel; // Assign new sequential IDs
        });

        // Update Firebase with reassigned hotel IDs
        await set(hotelsRef, newHotels);

        return res.status(200).json({
            success: true,
            message: `Hotel with ID ${idToDelete} deleted successfully, and IDs reassigned`
        });

    } catch (error) {
        console.error("Error deleting hotel:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { deleteProperty };
