const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");

const createBooking = async (req, res) => {
    try {
        const {
            bookIn,
            bookOut,
            customerName,
            eta,
            etd,
            extraFee,
            hotelId,
            roomId,
            staffId,
            paymentStatus = "Unpaid", // Default value
            bookingStatus = "Pending" // Default value
        } = req.body;

        // Validate hotelId
        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnap = await get(hotelRef);
        
        if (!hotelSnap.exists()) {
            return res.status(400).json({ message: "Invalid hotelId" });
        }

        const hotelData = hotelSnap.val();

        // Validate roomId inside the hotel object
        if (!hotelData.Room || !hotelData.Room[roomId]) {
            return res.status(400).json({ message: "Invalid roomId for this hotel" });
        }

        // Validate staffId and ensure it belongs to the same hotel
        const staffRef = ref(database, `Staff/${staffId}`);
        const staffSnap = await get(staffRef);
        if (!staffSnap.exists() || staffSnap.val().HotelId !== hotelId) {
            return res.status(400).json({ message: "Invalid staffId or staff does not belong to this hotel" });
        }

        // Ensure unique booking ID
        const bookingRef = ref(database, "Booking");
        const bookingSnap = await get(bookingRef);
        
        let bookingId = "booking1"; // Start with "booking1"
        let count = 1;

        if (bookingSnap.exists()) {
            const existingBookings = bookingSnap.val();
            while (existingBookings[bookingId]) {
                count++;
                bookingId = `booking${count}`;
            }
        }

        // Create booking entry
        const newBookingRef = ref(database, `Booking/${bookingId}`);
        await set(newBookingRef, {
            bookIn,
            bookOut,
            customerName,
            eta,
            etd,
            extraFee,
            hotelId,
            roomId,
            staffId,
            paymentStatus,
            bookingStatus
        });

        // Add notification with type "booking"
        const { createNotification } = require("../notifications/createNotification");
        const message = `New booking received: ${bookingId}`;
        await createNotification("booking", message);

        res.status(201).json({ message: "Booking created successfully", bookingId });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking", error: error.message });
    }
};

module.exports = { createBooking };