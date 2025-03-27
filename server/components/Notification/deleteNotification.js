const { database } = require("../config/firebaseconfig");
const { ref, get, set, remove } = require("firebase/database");

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params; // Extract the ID from URL params

    // Validate notificationId
    if (typeof notificationId !== "string" && typeof notificationId !== "number") {
      throw new Error("Invalid notificationId: Must be a string or number, got " + typeof notificationId);
    }

    const idToDelete = String(notificationId);
    const numericId = Number(idToDelete);
    if (isNaN(numericId) || numericId < 1) {
      throw new Error(`Invalid notificationId: "${idToDelete}" is not a valid positive number`);
    }

    const notificationsRef = ref(database, `Notifications`);
    const notificationsSnapshot = await get(notificationsRef);

    if (!notificationsSnapshot.exists()) {
      throw new Error("No notifications found in the database.");
    }

    const notificationsData = notificationsSnapshot.val();
    const notificationIds = Object.keys(notificationsData).map(Number).sort((a, b) => a - b);

    // Check if the notificationId exists
    if (!notificationIds.includes(numericId)) {
      throw new Error(`Notification with ID ${idToDelete} does not exist`);
    }

    // Step 1: Remove the notification with the given ID
    const targetNotificationRef = ref(database, `Notifications/${idToDelete}`);
    await remove(targetNotificationRef);
    console.log(`Notification with ID ${idToDelete} deleted.`);

    // Step 2: Reassign IDs for all notifications after the deleted one
    const updatedNotifications = {};
    let newId = 1;

    for (const id of notificationIds) {
      if (id === numericId) continue; // Skip the deleted ID

      const notification = notificationsData[id];
      notification.id = String(newId); // Update the ID in the notification object
      updatedNotifications[newId] = notification;
      newId++;
    }

    // Step 3: Write the reorganized notifications back to Firebase
    if (Object.keys(updatedNotifications).length > 0) {
      await set(notificationsRef, updatedNotifications);
      console.log("Notification IDs reassigned successfully.");
    } else {
      // If no notifications remain, clear the Notifications node
      await set(notificationsRef, null);
      console.log("All notifications deleted; Notifications node cleared.");
    }

    // Send success response
    res.status(200).json({ message: `Notification ${idToDelete} deleted successfully` });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    res.status(500).json({ error: error.message });
  }
};
const clearAllNotifications = async (req, res) => {
    try {
      const notificationsRef = ref(database, `Notifications`);
      await set(notificationsRef, null);
      console.log("All notifications cleared.");
      res.status(200).json({ message: "All notifications cleared successfully" });
    } catch (error) {
      console.error("Error clearing all notifications:", error.message);
      res.status(500).json({ error: error.message });
    }
  };

module.exports = { deleteNotification, clearAllNotifications };