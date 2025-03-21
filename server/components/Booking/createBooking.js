const { database } = require("../config/firebaseconfig");
const { ref, set, get } = require("firebase/database");
const { createCustomer } = require("../Customer/createCustomer"); // Adjust path as needed

const createBooking = async (req, res) => {
    try {
        const {
            bookIn,
            bookOut,
            customerName, // We'll split this into firstName and lastName
            eta,
            etd,
            extraFee,
            hotelId,
            roomId,
            staffId,
            paymentStatus = "Unpaid", // Default value
            bookingStatus = "Pending" // Default value
        } = req.body;

        // Validate input data
        if (!hotelId || typeof hotelId !== "string") {
            return res.status(400).json({ message: "Invalid or missing hotelId" });
        }
        if (!roomId || typeof roomId !== "string") {
            return res.status(400).json({ message: "Invalid or missing roomId" });
        }
        if (!staffId || typeof staffId !== "string") {
            return res.status(400).json({ message: "Invalid or missing staffId" });
        }
        if (!customerName || typeof customerName !== "string") {
            return res.status(400).json({ message: "Invalid or missing customerName" });
        }
        if (!bookIn || typeof bookIn !== "string") {
            return res.status(400).json({ message: "Invalid or missing bookIn" });
        }
        if (!bookOut || typeof bookOut !== "string") {
            return res.status(400).json({ message: "Invalid or missing bookOut" });
        }

        // Split customerName into firstName and lastName
        const nameParts = customerName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown"; // Default if no last name

        if (!firstName) {
            return res.status(400).json({ message: "First name is required in customerName" });
        }

        // Validate hotelId
        console.log("Hotel path:", `Hotel/${hotelId}`);
        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnap = await get(hotelRef);
        if (!hotelSnap.exists()) {
            return res.status(400).json({ message: "Invalid hotelId" });
        }

        const hotelData = hotelSnap.val();

        // Validate roomId inside the hotel
        if (!hotelData.Room || !hotelData.Room[roomId]) {
            return res.status(400).json({ message: "Invalid roomId for this hotel" });
        }

        // Validate staffId
        console.log("Staff path:", `Staff/${staffId}`);
        const staffRef = ref(database, `Staff/${staffId}`);
        const staffSnap = await get(staffRef);
        if (!staffSnap.exists() || staffSnap.val().HotelId !== hotelId) {
            return res.status(400).json({ message: "Invalid staffId or staff does not belong to this hotel" });
        }

        // Call createCustomer to get or create customerId
        const customerReq = {
            body: {
                Email: "", // Placeholder; update when available
                FirstName: firstName,
                LastName: lastName,
                PhoneNumber: "", // Placeholder; update when available
                Note: ""
            }
        };
        const customerRes = {
            status: (code) => ({
                json: (data) => {
                    if (code >= 200 && code < 300) {
                        return data; // Success
                    } else {
                        throw new Error(data.error || "Failed to create customer");
                    }
                }
            })
        };

        const customerResult = await createCustomer(customerReq, customerRes);
        const customerId = customerResult.customerId;

        if (!customerId || typeof customerId !== "string") {
            throw new Error("Invalid customerId returned from createCustomer");
        }

        // Generate booking ID
        console.log("Booking path:", "Booking");
        const bookingRef = ref(database, "Booking");
        const bookingSnap = await get(bookingRef);
        let bookingId = "booking1";
        let count = 1;

        if (bookingSnap.exists()) {
            const existingBookings = bookingSnap.val();
            while (existingBookings[bookingId]) {
                count++;
                bookingId = `booking${count}`;
            }
        }

        // Create booking
        console.log("New booking path:", `Booking/${bookingId}`);
        const bookingData = {
            bookIn,
            bookOut,
            customerName,
            customerId,
            eta,
            etd,
            extraFee,
            hotelId,
            roomId,
            staffId,
            paymentStatus,
            bookingStatus
        };

        const newBookingRef = ref(database, `Booking/${bookingId}`);
        await set(newBookingRef, bookingData);

        // Return success response
        res.status(201).json({ message: "Booking created successfully", bookingId });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking", error: error.message });
    }
};

module.exports = { createBooking };