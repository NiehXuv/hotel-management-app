const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

// If using Node.js 17 or earlier, uncomment the following line:
// const fetch = require("node-fetch");

const financialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end) || start > end) {
      return res.status(400).json({
        success: false,
        error: "Invalid date range",
      });
    }

    console.log(`Date range: ${start.toISOString()} to ${end.toISOString()}`);

    // Step 1: Fetch all hotels
    const hotelsRef = ref(database, "Hotel");
    const hotelsSnapshot = await get(hotelsRef);

    if (!hotelsSnapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: 0,
          byRoomType: { type: "N/A", revenue: 0 },
          topProperty: { name: "N/A", revenue: 0 },
          detailedBreakdown: { revenueByProperty: [] },
          occupancyRates: {
            overall: 0,
            bestProperty: { name: "N/A", rate: 0 },
            bestRoomType: "N/A",
          },
        },
        message: "No hotels found in the database",
      });
    }

    const hotelsData = hotelsSnapshot.val();
    const hotelsList = Object.entries(hotelsData).map(([id, hotel]) => ({
      hotelId: id,
      name: hotel.Name,
    }));

    console.log("Hotels list:", hotelsList);

    // Step 2: Fetch details for each hotel by calling the showProperty endpoint
    let totalRevenue = 0;
    let totalRoomNights = 0;
    let totalOccupiedRoomNights = 0;
    const revenueByHotel = {};
    const revenueByRoomType = {};
    const roomTypeOccupancy = {};
    const occupancyByHotel = {};

    for (const hotel of hotelsList) {
      const hotelId = hotel.hotelId;
      try {
        // Construct the URL with query parameters
        const url = new URL(`http://localhost:5000/hotels/${hotelId}`);
        url.searchParams.append("startDate", startDate);
        url.searchParams.append("endDate", endDate);

        // Make HTTP request to the showProperty endpoint using fetch
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch hotel details");
        }

        const hotelDetails = data.data;

        // Aggregate revenue
        const revenue = hotelDetails.roomStatistics.revenueInRange;
        totalRevenue += revenue;
        revenueByHotel[hotelId] = revenue;

        // Aggregate room type revenue and occupancy
        hotelDetails.rooms.forEach((room) => {
          const roomType = room.RoomName || "Unknown";
          const roomId = room.roomNumber;

          // Initialize room type aggregates
          if (!revenueByRoomType[roomType]) {
            revenueByRoomType[roomType] = 0;
          }
          if (!roomTypeOccupancy[roomType]) {
            roomTypeOccupancy[roomType] = { total: 0, occupiedRoomNights: 0 };
          }

          // Add to room type occupancy
          roomTypeOccupancy[roomType].total += 1;

          // Calculate revenue for this room type by finding bookings for this room
          // Note: showProperty response doesn't include allBookings directly
          // We'll need to approximate room type revenue using the total revenue
          // A better approach would be to modify showProperty to return revenue per room type
          // For now, we'll distribute the hotel's revenue proportionally (simplified)
          const roomCount = hotelDetails.rooms.length;
          const revenuePerRoom = roomCount > 0 ? revenue / roomCount : 0;
          revenueByRoomType[roomType] += revenuePerRoom;

          // Room type occupancy (approximate using hotel's occupiedRoomNights)
          const daysInRange = (end - start) / (1000 * 60 * 60 * 24) + 1;
          const hotelTotalRoomNights = hotelDetails.roomStatistics.totalRooms * daysInRange;
          const hotelOccupiedRoomNights = (hotelDetails.roomStatistics.occupancyRate / 100) * hotelTotalRoomNights;
          roomTypeOccupancy[roomType].occupiedRoomNights = (roomTypeOccupancy[roomType].occupiedRoomNights || 0) + (hotelOccupiedRoomNights / roomCount);
        });

        // Aggregate occupancy
        const daysInRange = (end - start) / (1000 * 60 * 60 * 24) + 1;
        const hotelTotalRoomNights = hotelDetails.roomStatistics.totalRooms * daysInRange;
        const hotelOccupiedRoomNights = (hotelDetails.roomStatistics.occupancyRate / 100) * hotelTotalRoomNights;

        totalRoomNights += hotelTotalRoomNights;
        totalOccupiedRoomNights += hotelOccupiedRoomNights;

        occupancyByHotel[hotelId] = {
          totalRoomNights: hotelTotalRoomNights,
          occupiedRoomNights: hotelOccupiedRoomNights,
          rate: hotelDetails.roomStatistics.occupancyRate,
        };
      } catch (error) {
        console.error(`Error fetching details for hotel ${hotelId}:`, error.message);
        revenueByHotel[hotelId] = 0;
        occupancyByHotel[hotelId] = { totalRoomNights: 0, occupiedRoomNights: 0, rate: 0 };
      }
    }

    console.log("Revenue by Hotel:", revenueByHotel);
    console.log("Revenue by Room Type:", revenueByRoomType);
    console.log("Total Revenue:", totalRevenue);

    // Step 3: Identify the top property by revenue
    let topProperty = null;
    let topRevenue = 0;
    const revenueBreakdown = [];

    for (const hotel of hotelsList) {
      const hotelId = hotel.hotelId;
      const revenue = revenueByHotel[hotelId] || 0;
      const hotelName = hotel.name;

      revenueBreakdown.push({
        property: hotelName,
        revenue: Number(revenue.toFixed(2)),
      });

      if (revenue > topRevenue) {
        topRevenue = revenue;
        topProperty = {
          name: hotelName,
          revenue: Number(revenue.toFixed(2)),
        };
      }
    }

    console.log("Revenue Breakdown:", revenueBreakdown);

    // Step 4: Identify the top room type by revenue
    let topRoomType = null;
    let topRoomTypeRevenue = 0;

    for (const [roomType, revenue] of Object.entries(revenueByRoomType)) {
      if (revenue > topRoomTypeRevenue) {
        topRoomTypeRevenue = revenue;
        topRoomType = roomType;
      }
    }

    // Step 5: Calculate occupancy rates
    const overallOccupancyRate = totalRoomNights > 0 ? (totalOccupiedRoomNights / totalRoomNights) * 100 : 0;

    let bestPropertyByOccupancy = { name: "N/A", rate: 0 };
    let highestOccupancyRate = 0;

    for (const [hotelId, stats] of Object.entries(occupancyByHotel)) {
      const rate = stats.rate;
      const hotel = hotelsList.find((h) => h.hotelId === hotelId);
      const hotelName = hotel ? hotel.name : "Unknown Hotel";

      if (rate > highestOccupancyRate) {
        highestOccupancyRate = rate;
        bestPropertyByOccupancy = {
          name: hotelName,
          rate: Number(rate.toFixed(1)),
          occupied: stats.occupiedRoomNights,
          total: stats.totalRoomNights,
        };
      }
    }

    let bestRoomTypeByOccupancy = "N/A";
    let highestRoomTypeOccupancyRate = 0;

    for (const [roomType, stats] of Object.entries(roomTypeOccupancy)) {
      const totalRoomNights = stats.total * ((end - start) / (1000 * 60 * 60 * 24) + 1);
      const rate = totalRoomNights > 0 ? (stats.occupiedRoomNights / totalRoomNights) * 100 : 0;
      if (rate > highestRoomTypeOccupancyRate) {
        highestRoomTypeOccupancyRate = rate;
        bestRoomTypeByOccupancy = roomType;
      }
    }

    // Step 6: Prepare the response
    const response = {
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        byRoomType: {
          type: topRoomType || "N/A",
          revenue: Number(topRoomTypeRevenue.toFixed(2)),
        },
        topProperty: topProperty || { name: "N/A", revenue: 0 },
        detailedBreakdown: {
          revenueByProperty: revenueBreakdown,
        },
        occupancyRates: {
          overall: Number(overallOccupancyRate.toFixed(1)),
          bestProperty: bestPropertyByOccupancy,
          bestRoomType: bestRoomTypeByOccupancy,
        },
      },
      message: "Financial report generated successfully",
    };

    console.log("Final Response:", response);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error generating financial report:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = { financialReport };