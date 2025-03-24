const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

// Auth functions
const { sendResetEmail } = require('./components/Account/sendresetemail');
const { resetPassword } = require('./components/Account/resetpassword');
const { listAllBookings } = require('./components/Booking/listAllBooking');
const { createBooking } = require('./components/Booking/createBooking');
const { updateBooking } = require('./components/Booking/updateBooking');
const { removeBooking } = require('./components/Booking/removeBooking');

// Room functions
const { createRoom, getHotelIds } = require('./components/Room/createRoom');
const { updateRoomStatus } = require('./components/Room/updateRoomStatus');
const { updateRoom } = require('./components/Room/updateRoom');
const { listRooms } = require('./components/Room/listRooms');
const { deleteRoom } = require('./components/Room/deleteRoom');

// Hotel (Property) functions
const { createProperty } = require('./components/Property/createProperty');
const { listProperty } = require('./components/Property/listProperty');
const { updateProperty } = require('./components/Property/updateProperty');
const { deleteProperty } = require('./components/Property/deleteProperty');
const { getHotel } = require('./components/Property/getHotel'); // New function

// Customer
const { createCustomer } = require('./components/Customer/createCustomer');
const { listAllCustomers } = require('./components/Customer/listCustomer');
const { removeCustomer } = require('./components/Customer/removeCustomer');
const { updateCustomer } = require('./components/Customer/updateCustomer');

// Staff
const { listStaff } = require('./components/Staff/listStaff.js');

const app = express();
app.use(express.json());
app.use(cors());

// Account and Booking routes
app.post('/api/send-reset-email', sendResetEmail);
app.post('/api/reset-password', resetPassword);
app.get('/booking/list', listAllBookings);
app.post('/booking/create', createBooking);
app.put('/booking/:bookingId', updateBooking);
app.delete('/booking/:bookingId', removeBooking);

// Room routes
app.get('/api/hotels/ids', getHotelIds);
app.post('/api/rooms/:hotelId', createRoom);
app.put('/hotels/:hotelId/rooms/:roomNumber/status', updateRoomStatus);
app.put('/hotels/:hotelId/rooms/:roomNumber', updateRoom);
app.get('/api/hotels/:hotelId/rooms', listRooms);
app.delete('/hotels/:hotelId/rooms/:roomNumber', deleteRoom);

// Hotel (Property) routes
app.post('/api/hotel/create', createProperty);
app.get('/hotels', listProperty);
app.get('/hotels/:hotelId', getHotel); // New endpoint
app.put('/hotels/:hotelId', updateProperty);
app.delete('/hotels/:hotelId', deleteProperty);

// Customer
app.post('/customer/create', createCustomer);
app.get('/customer/list', listAllCustomers);
app.delete('/customer/delete/:customerId', removeCustomer);
app.put('/customer/update/:customerId', updateCustomer);

// Staff
app.get('/api/staff/list/:hotelId', listStaff);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));