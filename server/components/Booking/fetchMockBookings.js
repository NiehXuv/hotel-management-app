const fetch = require('node-fetch').default;
const { database } = require("../config/firebaseconfig");
const { ref, get, set } = require("firebase/database");
const { createCustomer } = require("../Customer/createCustomer"); // Adjust path as needed

const fetchMockBookings = async (req, res) => {
    console.log("Starting fetchMockBookings...");
    try {
        // Verify Firebase database initialization
        if (!database) {
            console.error("Firebase database not initialized");
            throw new Error("Firebase database not initialized");
        }

        // Fetch available hotels and rooms from Firebase
        console.log("Fetching hotels from Firebase...");
        const hotelsRef = ref(database, 'Hotel');
        let hotelsSnap;
        try {
            hotelsSnap = await get(hotelsRef);
            console.log("Hotels snapshot retrieved:", hotelsSnap.exists());
        } catch (error) {
            console.error("Error fetching hotels from Firebase:", error);
            throw new Error(`Failed to fetch hotels: ${error.message}`);
        }

        if (!hotelsSnap.exists()) {
            console.log("No hotels found in the database");
            return res.status(404).json({ message: "No hotels found in the database" });
        }

        const hotelsData = hotelsSnap.val();
        console.log("Hotels Data:", hotelsData);

        const hotelsList = Object.keys(hotelsData).map(hotelId => {
            const hotel = hotelsData[hotelId];
            const rooms = hotel.Room ? Object.keys(hotel.Room) : [];
            return { hotelId, rooms };
        });

        console.log("Hotels List:", hotelsList);

        if (hotelsList.length === 0 || hotelsList.every(hotel => hotel.rooms.length === 0)) {
            console.log("No hotels with rooms found in the database");
            return res.status(404).json({ message: "No hotels with rooms found in the database" });
        }

        // Fetch mock reservation data from Mocky.io
        console.log("Fetching mock reservations from Mocky.io...");
        let response;
        try {
            response = await fetch('https://run.mocky.io/v3/26b56841-2d80-468f-9543-1ca4486fc851', { // Replace with your new Mocky.io URL
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Mocky.io response status:", response.status);
        } catch (error) {
            console.error("Error fetching from Mocky.io:", error);
            throw new Error(`Failed to fetch mock reservations: ${error.message}`);
        }

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error fetching mock reservations:', errorData);
            throw new Error(`Failed to fetch mock reservations: ${errorData}`);
        }

        const mockBookings = await response.json();
        console.log("Mock reservations fetched:", mockBookings);

        // Map the mock reservations to your booking structure with validation and customer creation
        console.log("Mapping mock reservations to bookings...");
        const mappedBookings = await Promise.all(mockBookings.map(async (booking, index) => {
            const hotelIndex = index % hotelsList.length;
            const selectedHotel = hotelsList[hotelIndex];
            const hotelId = selectedHotel.hotelId;

            // Validate hotelId
            const hotelRef = ref(database, `Hotel/${hotelId}`);
            const hotelSnap = await get(hotelRef);
            if (!hotelSnap.exists()) {
                console.error(`Invalid hotelId: ${hotelId} for booking ${index + 1}`);
                throw new Error(`Invalid hotelId: ${hotelId}`);
            }

            const hotelData = hotelSnap.val();
            const availableRooms = hotelData.Room ? Object.keys(hotelData.Room) : [];
            if (availableRooms.length === 0) {
                console.error(`No rooms found for hotelId: ${hotelId}`);
                throw new Error(`No rooms found for hotelId: ${hotelId}`);
            }

            const roomId = availableRooms[Math.floor(Math.random() * availableRooms.length)];

            // Validate staffId
            const staffRef = ref(database, `Staff/${booking.staff_id}`);
            const staffSnap = await get(staffRef);
            if (!staffSnap.exists() || staffSnap.val().HotelId !== hotelId) {
                console.error(`Invalid staffId: ${booking.staff_id} for hotelId: ${hotelId}`);
                throw new Error(`Invalid staffId: ${booking.staff_id}`);
            }

            // Create or get customer
            const customerReq = {
                body: {
                    Email: booking.customer.email || "",
                    FirstName: booking.customer.first_name,
                    LastName: booking.customer.last_name,
                    PhoneNumber: booking.customer.phone || "",
                    Note: ""
                }
            };
            const customerRes = {
                status: (code) => ({
                    json: (data) => {
                        if (code >= 200 && code < 300) return data;
                        else throw new Error(data.error || "Failed to create customer");
                    }
                })
            };
            const customerResult = await createCustomer(customerReq, customerRes);
            const customerId = customerResult.customerId || booking.customer.id; // Fallback to mock ID if creation fails

            const bookingId = `mockBooking${index + 1}`;
            const bookingData = {
                bookIn: booking.check_in_date,
                bookOut: booking.check_out_date,
                customerId: customerId,
                eta: booking.arrival_time,
                etd: booking.departure_time,
                extraFee: booking.extra_fees,
                hotelId: hotelId,
                roomId: roomId,
                staffId: booking.staff_id,
                paymentStatus: booking.payment_status,
                bookingStatus: booking.status,
                optimalPrice: booking.total_price,
                customerName: `${booking.customer.first_name} ${booking.customer.last_name}`
            };

            console.log(`Created booking ${bookingId}:`, bookingData);

            const bookingRef = ref(database, `Booking/${bookingId}`);
            try {
                await set(bookingRef, bookingData);
                console.log(`Successfully wrote booking ${bookingId} to Firebase`);
            } catch (error) {
                console.error(`Error writing booking ${bookingId} to Firebase:`, error);
                throw new Error(`Failed to write booking ${bookingId}: ${error.message}`);
            }

            return { id: bookingId, ...bookingData };
        }));

        console.log("Mock bookings created successfully:", mappedBookings);
        res.status(200).json({ message: "Mock bookings fetched successfully", bookings: mappedBookings });

    } catch (error) {
        console.error("Error fetching mock bookings:", error);
        res.status(500).json({ message: "Error fetching mock bookings", error: error.message });
    }
};

module.exports = { fetchMockBookings };