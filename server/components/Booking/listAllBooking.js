const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

const listAllBookings = async (req, res) => {
    try {
        const bookingRef = ref(database, "Booking");
        const snapshot = await get(bookingRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "No bookings found" });
        }

        const bookings = snapshot.val();
        const today = new Date('2025-03-28'); // Current date (you can dynamically set this with new Date())
        today.setHours(0, 0, 0, 0); // Normalize to start of the day for comparison

        // Convert bookings object to an array for easier filtering
        const bookingArray = Object.values(bookings);

        // Calculate check-ins today
        const checkinsToday = bookingArray.filter(booking => {
            const checkinDate = new Date(booking.bookIn);
            checkinDate.setHours(0, 0, 0, 0); // Normalize to start of the day
            return checkinDate.getTime() === today.getTime();
        }).length;

        // Calculate check-outs today
        const checkoutsToday = bookingArray.filter(booking => {
            const checkoutDate = new Date(booking.bookOut);
            checkoutDate.setHours(0, 0, 0, 0); // Normalize to start of the day
            return checkoutDate.getTime() === today.getTime();
        }).length;

        // Return the original bookings along with the counts
        res.json({
            bookings: bookings,
            checkinsToday: checkinsToday,
            checkoutsToday: checkoutsToday
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving bookings", error: error.message });
    }
};

module.exports = { listAllBookings };