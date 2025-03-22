const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

const listProperty = async (req, res) => {
    try {
        const hotelsRef = ref(database, 'Hotel');
        const hotelSnapshot = await get(hotelsRef);

        if (!hotelSnapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No hotels found in the database"
            });
        }

        const hotelsData = hotelSnapshot.val();
        const hotelsList = Object.entries(hotelsData).map(([id, hotel]) => ({
            hotelId: id,
            Name: hotel.Name,
            Description: hotel.Description,
            Location: hotel.Location,
            Email: hotel.Email,
            PhoneNumber: hotel.PhoneNumber
        }));

        return res.status(200).json({
            success: true,
            data: hotelsList,
            message: "Hotels retrieved successfully",
            count: hotelsList.length
        });

    } catch (error) {
        console.error("Error listing hotels:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

module.exports = { listProperty };