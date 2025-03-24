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
                statistics: {
                    totalProperties: 0,
                    totalRooms: 0,
                    occupiedRooms: 0,
                    occupancyRate: 0
                },
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

        // Calculate statistics
        let totalRooms = 0;
        let occupiedRooms = 0;

        // Iterate through each hotel to count rooms
        for (const [hotelId, hotel] of Object.entries(hotelsData)) {
            const roomsRef = ref(database, `Hotel/${hotelId}/Room`);
            const roomSnapshot = await get(roomsRef);

            if (roomSnapshot.exists()) {
                const roomsData = roomSnapshot.val();
                const roomsList = Object.entries(roomsData).map(([roomNumber, data]) => ({
                    roomNumber,
                    ...data
                }));

                totalRooms += roomsList.length; // Add to total rooms
                // Count occupied rooms
                const occupiedForHotel = roomsList.filter(room => room.Status === 'Occupied').length;
                occupiedRooms += occupiedForHotel;
            }
        }

        // Calculate occupancy rate (handle division by zero)
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        return res.status(200).json({
            success: true,
            data: hotelsList,
            statistics: {
                totalProperties: hotelsList.length,
                totalRooms: totalRooms,
                occupiedRooms: occupiedRooms,
                occupancyRate: Number(occupancyRate.toFixed(1)) // Round to 1 decimal place
            },
            message: "Hotels retrieved successfully"
        });

    } catch (error) {
        console.error("Error listing hotels:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { listProperty };