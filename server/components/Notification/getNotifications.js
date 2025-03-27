const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

const getNotifications = async (req, res) => {
  try {
    const { hotelId } = req.params; // hotelId is optional

    // Reference to the notifications
    const notificationsRef = ref(database, `Notifications`);
    const notificationsSnapshot = await get(notificationsRef);

    if (!notificationsSnapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No notifications found",
      });
    }

    // Fetch all hotels to map hotelId to hotel name
    const hotelsRef = ref(database, `Hotel`);
    const hotelsSnapshot = await get(hotelsRef);
    const hotels = hotelsSnapshot.exists() ? hotelsSnapshot.val() : {};

    // Process notifications
    const notificationsData = notificationsSnapshot.val();
    let notifications = Object.entries(notificationsData)
      .filter(([id, notification]) => notification.id) // Exclude any non-notification entries like counters
      .map(([id, notification]) => ({
        id,
        ...notification,
        hotelName: hotels[notification.hotelId]?.Name || `Hotel ${notification.hotelId}`, // Add hotel name
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp (newest first)

    // Filter by hotelId if provided
    if (hotelId) {
      notifications = notifications.filter(
        (notification) => String(notification.hotelId) === String(hotelId)
      );
    }

    return res.status(200).json({
      success: true,
      data: notifications,
      message: "Notifications retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = { getNotifications };