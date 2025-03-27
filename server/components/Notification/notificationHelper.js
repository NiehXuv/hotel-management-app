const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");

// Helper function to add a notification
const addNotification = async (hotelId, type, action, message, roomNumber, user = "System") => {
  try {
    // Reference to the NotificationCounter for the hotel
    const counterRef = ref(database, `Notifications/NotificationCounter`);
    const counterSnapshot = await get(counterRef);
    let nextId = 1; // Default to 1 if counter doesn't exist

    if (counterSnapshot.exists()) {
      nextId = counterSnapshot.val() + 1;
    }

    // Reference to the specific notification with the new ID
    const notificationRef = ref(database, `/Notifications/${nextId}`);
    const notification = {
      id: nextId, // Include the ID in the notification object
      hotelId: String(hotelId),
      type,
      action,
      message,
      roomNumber,
      user,
      timestamp: new Date().toISOString(),
    };

    // Save the notification
    await set(notificationRef, notification);

    // Update the NotificationCounter
    await set(counterRef, nextId);

    console.log(`Notification added with ID ${nextId}: ${message}`);
  } catch (error) {
    console.error("Error adding notification:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = { addNotification };