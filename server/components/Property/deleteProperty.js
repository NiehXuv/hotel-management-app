const { database } = require("../config/firebaseconfig");
const { ref, remove } = require("firebase/database");

const deleteProperty = async (req, res) => {
    try {
        const { hotelId } = req.params; // Extract hotelId from URL parameters

        const hotelRef = ref(database, `Hotel/${hotelId}`);

        // Check if the hotel exists before attempting deletion (optional but recommended)
        const snapshot = await get(hotelRef);
        if (!snapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: "Hotel not found",
            });
        }

        // Delete the hotel from Firebase
        await remove(hotelRef);

        return res.status(200).json({
            success: true,
            message: "Hotel deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting hotel:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

module.exports = { deleteProperty };