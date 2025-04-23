// financialReport.js
const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

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
          hotelDetails: [],
        },
        message: "No hotels found in the database",
      });
    }

    const bookingsRef = ref(database, "Booking");
    const bookingsSnapshot = await get(bookingsRef);

    const ratingsRef = ref(database, "Ratings");
    const ratingsSnapshot = await get(ratingsRef);

    let totalRevenue = 0;
    let totalOccupiedRooms = 0;
    let totalOccupancyBase = 0;
    const revenueByHotel = {};
    const revenueByRoomType = {};
    const roomTypeOccupancy = {};
    const occupancyByHotel = {};
    const hotelsList = [];
    const hotelDetailsList = [];

    const hotelsData = hotelsSnapshot.val();
    for (const [hotelId, hotel] of Object.entries(hotelsData)) {
      hotelsList.push({ hotelId, name: hotel.Name });

      const roomsRef = ref(database, `Hotel/${hotelId}/Room`);
      const roomSnapshot = await get(roomsRef);
      const roomPriceMap = {};
      let totalRooms = 0;
      let hotelOccupiedRooms = 0;
      let hotelAvailableRooms = 0;
      let roomsList = [];

      if (roomSnapshot.exists()) {
        const roomsData = roomSnapshot.val();
        roomsList = Object.entries(roomsData)
          .filter(
            ([roomNumber]) =>
              ![
                "ActivityCounter",
                "IssueCounter",
                "EquipmentCounter",
                "BookingCounter",
              ].includes(roomNumber)
          )
          .map(([roomNumber, data]) => {
            if (data.PriceByNight) {
              roomPriceMap[String(roomNumber)] = data.PriceByNight;
            }
            return {
              roomNumber,
              ...data,
              Activity: data.Activity
                ? Object.entries(data.Activity).map(([id, activity]) => ({
                    id,
                    ...activity,
                  }))
                : [],
              Issue: data.Issue
                ? Object.entries(data.Issue).map(([id, issue]) => ({
                    id,
                    ...issue,
                    roomNumber,
                  }))
                : [],
              Equipment: data.Equipment
                ? Object.entries(data.Equipment).map(([id, equipment]) => ({
                    id,
                    ...equipment,
                  }))
                : [],
            };
          });

        totalRooms = roomsList.length;
        hotelOccupiedRooms = roomsList.filter((room) => room.Status === "Occupied").length;
        hotelAvailableRooms = roomsList.filter((room) => room.Status === "Available").length;
      }

      const hotelTotalOccupancyBase = hotelOccupiedRooms + hotelAvailableRooms;
      const hotelOccupancyRate = hotelTotalOccupancyBase > 0 ? (hotelOccupiedRooms / hotelTotalOccupancyBase) * 100 : 0;

      totalOccupiedRooms += hotelOccupiedRooms;
      totalOccupancyBase += hotelTotalOccupancyBase;

      let hotelRevenue = 0;
      let allActivities = [];
      let allIssues = [];
      const priceRange = { min: Infinity, max: -Infinity };

      roomsList.forEach((room) => {
        if (room.PriceByNight) {
          priceRange.min = Math.min(priceRange.min, room.PriceByNight);
          priceRange.max = Math.max(priceRange.max, room.PriceByNight);
        }
        if (room.Activity) {
          allActivities.push(
            ...room.Activity.map((activity) => ({
              ...activity,
              roomNumber: room.roomNumber,
            }))
          );
        }
        if (room.Issue) {
          allIssues.push(...room.Issue);
        }
      });

      allActivities.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      allIssues.sort((a, b) => new Date(b.ReportedAt) - new Date(a.Timestamp));

      const dailyRevenue = roomsList
        .filter((room) => room.Status === "Occupied")
        .reduce((sum, room) => sum + (room.PriceByNight || 0), 0);

      if (bookingsSnapshot.exists()) {
        const bookingsData = bookingsSnapshot.val();
        const hotelBookings = Object.values(bookingsData).filter(
          (booking) => String(booking.hotelId) === String(hotelId)
        );

        hotelBookings.forEach((booking) => {
          const bookIn = new Date(booking.bookIn);
          const bookOut = new Date(booking.bookOut);

          const stayStart = new Date(Math.max(bookIn, start));
          const stayEnd = new Date(Math.min(bookOut, end));
          const overlappingDays = Math.max(0, (stayEnd - stayStart) / (1000 * 60 * 60 * 24));

          if (overlappingDays > 0) {
            const roomId = String(booking.roomId);
            const priceByNight = roomPriceMap[roomId] || 0;
            const totalPrice = priceByNight * overlappingDays;
            hotelRevenue += totalPrice;

            const room = roomsList.find((r) => r.roomNumber === roomId);
            const roomType = room?.RoomName || "Unknown";
            revenueByRoomType[roomType] = (revenueByRoomType[roomType] || 0) + totalPrice;
          }
        });
      }

      totalRevenue += hotelRevenue;
      revenueByHotel[hotelId] = hotelRevenue;
      occupancyByHotel[hotelId] = {
        totalRoomNights: hotelTotalOccupancyBase,
        occupiedRoomNights: hotelOccupiedRooms,
        rate: Number(hotelOccupancyRate.toFixed(2)), // Round to 2 decimal places
      };

      let weeklyRevenue = 0;
      let monthlyRevenue = 0;
      let yearToDateRevenue = 0;
      let totalStayDays = 0;
      let validBookingCount = 0;
      const now = new Date();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const sevenDaysAgo = new Date(now.getTime() - 7 * oneDayMs);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * oneDayMs);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const hotelBookings = bookingsSnapshot.exists()
        ? Object.values(bookingsSnapshot.val()).filter(
            (booking) => String(booking.hotelId) === String(hotelId)
          )
        : [];

      hotelBookings.forEach((booking) => {
        const bookIn = new Date(`${booking.bookIn}T00:00:00Z`);
        const bookOut = new Date(`${booking.bookOut}T00:00:00Z`);
        const stayDurationDays = (bookOut - bookIn) / oneDayMs;

        const roomId = String(booking.roomId);
        const priceByNight = roomPriceMap[roomId] || 0;

        if (stayDurationDays <= 0 || !priceByNight) return;

        totalStayDays += stayDurationDays;
        validBookingCount += 1;

        const dailyRate = priceByNight;

        const calculateRevenueForPeriod = (periodStart, periodEnd) => {
          const stayStart = new Date(Math.max(bookIn, periodStart));
          const stayEnd = new Date(Math.min(bookOut, periodEnd));
          const daysInPeriod = Math.max(0, (stayEnd - stayStart) / oneDayMs);
          return daysInPeriod * dailyRate;
        };

        if (bookIn <= now && bookOut >= sevenDaysAgo) {
          weeklyRevenue += calculateRevenueForPeriod(sevenDaysAgo, now);
        }
        if (bookIn <= now && bookOut >= thirtyDaysAgo) {
          monthlyRevenue += calculateRevenueForPeriod(thirtyDaysAgo, now);
        }
        if (bookIn <= now && bookOut >= yearStart) {
          yearToDateRevenue += calculateRevenueForPeriod(yearStart, now);
        }
      });

      const averageStayDuration =
        validBookingCount > 0 ? (totalStayDays / validBookingCount).toFixed(1) : 0;

      let averageRating = 0;
      if (ratingsSnapshot.exists()) {
        const ratingsData = ratingsSnapshot.val();
        const hotelRatings = Object.values(ratingsData)
          .filter((rating) => String(rating.hotelId) === String(hotelId))
          .map((rating) => rating.value || 0);

        const totalRating = hotelRatings.reduce((sum, rating) => sum + rating, 0);
        averageRating = hotelRatings.length > 0
          ? (totalRating / hotelRatings.length).toFixed(1)
          : 0;
      }

      hotelDetailsList.push({
        hotelId,
        name: hotel.Name,
        description: hotel.Description,
        location: hotel.Location,
        email: hotel.Email,
        phoneNumber: hotel.PhoneNumber,
        status: hotel.Status,
        roomStatistics: {
          totalRooms,
          occupiedRooms: Number(hotelOccupiedRooms.toFixed(0)),
          availableRooms: hotelAvailableRooms,
          needsCleaning: roomsList.filter((room) => room.Status === "Dirty").length,
          maintenance: roomsList.filter((room) => room.Status === "Maintenance").length,
          occupancyRate: Number(hotelOccupancyRate.toFixed(2)), // Round to 2 decimal places
          dailyRevenue: Number(dailyRevenue.toFixed(2)),
          priceRange:
            priceRange.min === Infinity
              ? "N/A"
              : `$${priceRange.min}-${priceRange.max}`,
          revenueInRange: Number(hotelRevenue.toFixed(2)),
          weeklyRevenue: Number(weeklyRevenue.toFixed(2)),
          monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
          yearToDateRevenue: Number(yearToDateRevenue.toFixed(2)),
          averageStayDuration: Number(averageStayDuration),
          averageRating: Number(averageRating),
        },
        rooms: roomsList,
        activities: allActivities,
        issues: allIssues,
      });
    }

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

    let topRoomType = null;
    let topRoomTypeRevenue = 0;

    for (const [roomType, revenue] of Object.entries(revenueByRoomType)) {
      if (revenue > topRoomTypeRevenue) {
        topRoomTypeRevenue = revenue;
        topRoomType = roomType;
      }
    }

    const overallOccupancyRate = totalOccupancyBase > 0 ? (totalOccupiedRooms / totalOccupancyBase) * 100 : 0;

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
          rate: Number(rate.toFixed(2)), // Round to 2 decimal places
          occupied: stats.occupiedRoomNights,
          total: stats.totalRoomNights,
        };
      }
    }

    let bestRoomTypeByOccupancy = "N/A";
    let highestRoomTypeOccupancyRate = 0;

    for (const [roomType, stats] of Object.entries(roomTypeOccupancy)) {
      const totalRoomNights = stats.total;
      const rate = totalRoomNights > 0 ? (stats.occupiedRoomNights / totalRoomNights) * 100 : 0;
      if (rate > highestRoomTypeOccupancyRate) {
        highestRoomTypeOccupancyRate = rate;
        bestRoomTypeByOccupancy = roomType;
      }
    }

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
          overall: Number(overallOccupancyRate.toFixed(2)), // Round to 2 decimal places
          bestProperty: bestPropertyByOccupancy,
          bestRoomType: bestRoomTypeByOccupancy,
        },
        hotelDetails: hotelDetailsList,
      },
      message: "Financial report generated successfully",
    };

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