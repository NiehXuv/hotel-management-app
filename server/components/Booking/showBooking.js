const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

const showBooking = async (req, res) => {
    try {
        // Extract bookingId from the URL parameters
        const { bookingId } = req.params;

        // Validate bookingId
        if (!bookingId || typeof bookingId !== "string") {
            return res.status(400).json({ message: "Invalid or missing bookingId" });
        }

        // Construct the path to the booking in the database
        const bookingPath = `Booking/${bookingId}`;
        console.log("Fetching booking from path:", bookingPath);
        const bookingRef = ref(database, bookingPath);

        // Retrieve the booking data
        const bookingSnap = await get(bookingRef);

        // Check if the booking exists
        if (!bookingSnap.exists()) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Get the booking data
        const bookingData = bookingSnap.val();

        // Return the booking details
        res.status(200).json({
            message: "Booking retrieved successfully",
            bookingId,
            booking: bookingData
        });
    } catch (error) {
        console.error("Error retrieving booking:", error);
        res.status(500).json({ message: "Error retrieving booking", error: error.message });
    }
};

module.exports = { showBooking };