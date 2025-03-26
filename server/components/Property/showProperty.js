const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

const showProperty = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        error: "Hotel ID is required",
      });
    }

    console.log(`Fetching data for hotelId: ${hotelId}`);

    const hotelRef = ref(database, `Hotel/${hotelId}`);
    const hotelSnapshot = await get(hotelRef);

    if (!hotelSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        error: "Hotel not found",
      });
    }

    const hotelData = hotelSnapshot.val();

    const roomsRef = ref(database, `Hotel/${hotelId}/Room`);
    const roomSnapshot = await get(roomsRef);

    // Fetch bookings from the root /Booking path
    const bookingsRef = ref(database, `Booking`);
    const bookingsSnapshot = await get(bookingsRef);

    // Fetch ratings from the root /Ratings path (hypothetical)
    const ratingsRef = ref(database, `Ratings`);
    const ratingsSnapshot = await get(ratingsRef);

    let totalRooms = 0;
    let occupiedRooms = 0;
    let availableRooms = 0;
    let needsCleaning = 0;
    let maintenance = 0;
    let dailyRevenue = 0;
    let roomsList = [];
    let allActivities = [];
    let allIssues = [];
    let priceRange = { min: Infinity, max: -Infinity };
    let allBookings = [];
    let roomPriceMap = {};

    if (roomSnapshot.exists()) {
      const roomsData = roomSnapshot.val();
      roomsList = Object.entries(roomsData)
        .map(([roomNumber, data]) => {
          if (
            roomNumber === "ActivityCounter" ||
            roomNumber === "IssueCounter" ||
            roomNumber === "EquipmentCounter" ||
            roomNumber === "BookingCounter"
          ) {
            return null;
          }

          const room = {
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

          if (data.PriceByNight) {
            roomPriceMap[roomNumber] = data.PriceByNight;
          } else {
            console.log(`Room ${roomNumber} has no PriceByNight`);
          }

          if (room.Activity) {
            allActivities.push(
              ...room.Activity.map((activity) => ({
                ...activity,
                roomNumber,
              }))
            );
          }
          if (room.Issue) {
            allIssues.push(...room.Issue);
          }

          if (data.PriceByNight) {
            priceRange.min = Math.min(priceRange.min, data.PriceByNight);
            priceRange.max = Math.max(priceRange.max, data.PriceByNight);
          }

          return room;
        })
        .filter((room) => room !== null);

      totalRooms = roomsList.length;
      occupiedRooms = roomsList.filter((room) => room.Status === "Occupied").length;
      availableRooms = roomsList.filter((room) => room.Status === "Available").length;
      needsCleaning = roomsList.filter((room) => room.Status === "Dirty").length;
      maintenance = roomsList.filter((room) => room.Status === "Maintenance").length;
      dailyRevenue = roomsList
        .filter((room) => room.Status === "Occupied")
        .reduce((sum, room) => sum + (room.PriceByNight || 0), 0);

      allActivities.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      allIssues.sort((a, b) => new Date(b.ReportedAt) - new Date(a.Timestamp));
    }

    console.log("Room Price Map:", roomPriceMap);

    // Process bookings from the root /Booking path
    if (bookingsSnapshot.exists()) {
      const bookingsData = bookingsSnapshot.val();
      allBookings = Object.entries(bookingsData)
        .map(([id, booking]) => ({
          id,
          ...booking,
        }))
        .filter((booking) => String(booking.hotelId) === String(hotelId));

      console.log(`Total bookings found: ${Object.keys(bookingsData).length}`);
      console.log(`Bookings for hotelId ${hotelId} (after filtering): ${allBookings.length}`);
      console.log("Sample booking:", allBookings[0] || "No bookings");
    } else {
      console.log("No bookings found in /Booking");
    }

    // Calculate weekly, monthly, and year-to-date revenue
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

    console.log(`Current date: ${now.toISOString()}`);
    console.log(`Seven days ago: ${sevenDaysAgo.toISOString()}`);
    console.log(`Thirty days ago: ${thirtyDaysAgo.toISOString()}`);
    console.log(`Year start: ${yearStart.toISOString()}`);

    allBookings.forEach((booking, index) => {
      const bookIn = new Date(`${booking.bookIn}T00:00:00Z`);
      const bookOut = new Date(`${booking.bookOut}T00:00:00Z`);
      const stayDurationDays = (bookOut - bookIn) / oneDayMs;

      const roomId = String(booking.roomId);
      const priceByNight = roomPriceMap[roomId] || 0;
      const totalPrice = priceByNight * stayDurationDays;

      console.log(`Booking ${index + 1}:`);
      console.log(`  bookIn: ${booking.bookIn}, parsed: ${bookIn.toISOString()}`);
      console.log(`  bookOut: ${booking.bookOut}, parsed: ${bookOut.toISOString()}`);
      console.log(`  roomId: ${roomId}, priceByNight: ${priceByNight}`);
      console.log(`  stayDurationDays: ${stayDurationDays}`);
      console.log(`  totalPrice: ${totalPrice}`);

      if (stayDurationDays <= 0 || !priceByNight) {
        console.log(`  Skipping booking due to invalid data (stayDurationDays: ${stayDurationDays}, priceByNight: ${priceByNight})`);
        return;
      }

      // Accumulate stay duration for average calculation
      totalStayDays += stayDurationDays;
      validBookingCount += 1;

      const dailyRate = priceByNight;

      const calculateRevenueForPeriod = (periodStart, periodEnd) => {
        const stayStart = new Date(Math.max(bookIn, periodStart));
        const stayEnd = new Date(Math.min(bookOut, periodEnd));
        const daysInPeriod = Math.max(0, (stayEnd - stayStart) / oneDayMs);
        const revenue = daysInPeriod * dailyRate;
        console.log(
          `  Period ${periodStart.toISOString()} to ${periodEnd.toISOString()}: ` +
          `daysInPeriod: ${daysInPeriod}, revenue: ${revenue}`
        );
        return revenue;
      };

      if (bookIn <= now && bookOut >= sevenDaysAgo) {
        const revenue = calculateRevenueForPeriod(sevenDaysAgo, now);
        weeklyRevenue += revenue;
        console.log(`  Added to weeklyRevenue: ${revenue}`);
      } else {
        console.log(`  Booking does not overlap with last 7 days`);
      }

      if (bookIn <= now && bookOut >= thirtyDaysAgo) {
        const revenue = calculateRevenueForPeriod(thirtyDaysAgo, now);
        monthlyRevenue += revenue;
        console.log(`  Added to monthlyRevenue: ${revenue}`);
      } else {
        console.log(`  Booking does not overlap with last 30 days`);
      }

      if (bookIn <= now && bookOut >= yearStart) {
        const revenue = calculateRevenueForPeriod(yearStart, now);
        yearToDateRevenue += revenue;
        console.log(`  Added to yearToDateRevenue: ${revenue}`);
      } else {
        console.log(`  Booking does not overlap with year-to-date`);
      }
    });

    // Calculate average stay duration
    const averageStayDuration = validBookingCount > 0 ? (totalStayDays / validBookingCount).toFixed(1) : 0;

    // Calculate average rating (hypothetical /Ratings node)
    let averageRating = 0;
    if (ratingsSnapshot.exists()) {
      const ratingsData = ratingsSnapshot.val();
      const hotelRatings = Object.values(ratingsData)
        .filter((rating) => String(rating.hotelId) === String(hotelId))
        .map((rating) => rating.value || 0);

      const totalRating = hotelRatings.reduce((sum, rating) => sum + rating, 0);
      averageRating = hotelRatings.length > 0 ? (totalRating / hotelRatings.length).toFixed(1) : 0;
    }

    console.log(`Average Stay Duration: ${averageStayDuration} days`);
    console.log(`Average Rating: ${averageRating}`);
    console.log(`Final weeklyRevenue: ${weeklyRevenue}`);
    console.log(`Final monthlyRevenue: ${monthlyRevenue}`);
    console.log(`Final yearToDateRevenue: ${yearToDateRevenue}`);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const hotelDetails = {
      hotelId,
      name: hotelData.Name,
      description: hotelData.Description,
      location: hotelData.Location,
      email: hotelData.Email,
      phoneNumber: hotelData.PhoneNumber,
      status: hotelData.Status,
      roomStatistics: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        needsCleaning,
        maintenance,
        occupancyRate: Number(occupancyRate.toFixed(1)),
        dailyRevenue: Number(dailyRevenue.toFixed(2)),
        priceRange: priceRange.min === Infinity ? "N/A" : `$${priceRange.min}-${priceRange.max}`,
        weeklyRevenue: Number(weeklyRevenue.toFixed(2)),
        monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
        yearToDateRevenue: Number(yearToDateRevenue.toFixed(2)),
        averageStayDuration: Number(averageStayDuration), // Add to roomStatistics
        averageRating: Number(averageRating), // Add to roomStatistics
      },
      rooms: roomsList,
      activities: allActivities,
      issues: allIssues,
    };

    return res.status(200).json({
      success: true,
      data: hotelDetails,
      message: "Hotel details retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving hotel details:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = { showProperty };