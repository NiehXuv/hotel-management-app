const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

// Helper function to add a notification with a sequential ID
const addNotification = async (hotelId, type, action, message, roomNumber, user = "System") => {
  try {
    const notificationsRef = ref(database, `Notifications`);
    const notificationsSnapshot = await get(notificationsRef);

    // Count existing notifications to determine the next ID
    let nextId = 1; // Start with 1 if there are no notifications
    if (notificationsSnapshot.exists()) {
      const notificationsData = notificationsSnapshot.val();
      const notificationCount = Object.keys(notificationsData).length;
      nextId = notificationCount + 1; // Next ID is the count + 1
    }

    // Fetch the hotel name from /Hotel/{hotelId}
    const hotelRef = ref(database, `Hotel/${hotelId}`);
    const hotelSnapshot = await get(hotelRef);
    let hotelName = `Hotel ${hotelId}`; // Default name if hotel not found
    if (hotelSnapshot.exists()) {
      const hotelData = hotelSnapshot.val();
      hotelName = hotelData.Name || `Hotel ${hotelId}`;
    }

    // Update the message to include the hotel name
    const updatedMessage = `${hotelName}:${message}`;

    // Create a reference for the new notification with the sequential ID
    const newNotificationRef = ref(database, `Notifications/${nextId}`);

    const notification = {
      id: String(nextId), // Store the ID in the notification data for easy access
      hotelId: String(hotelId),
      type,
      action,
      message: updatedMessage, // Use the updated message with hotel name
      roomNumber,
      user,
      timestamp: new Date().toISOString(),
      hotelName, // Store hotelName for frontend use
    };

    await set(newNotificationRef, notification);
    console.log(`Notification added with ID ${nextId}: ${updatedMessage}`);
  } catch (error) {
    console.error("Error adding notification:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = { addNotification };