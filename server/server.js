const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config(); // Load environment variables

//Auth functions
const { sendResetEmail } = require('./components/Account/sendresetemail');
const { resetPassword } = require('./components/Account/resetpassword');
const { listAllBookings } = require('./components/Booking/listAllBooking');
const { createBooking } = require('./components/Booking/createBooking');
// Room functions
const { createRoom, getHotelIds} = require('./components/Room/createRoom');
const { updateRoomStatus } = require('./components/Room/updateRoomStatus');
const { updateRoom } = require('./components/Room/updateRoom');
const { listRooms } = require('./components/Room/listRooms');


//Hotel(Property) functions
const { createProperty } = require('./components/Property/createProperty');

//Customer
const { createCustomer } = require('./components/Customer/createCustomer');
const { listAllCustomers } = require('./components/Customer/listCustomer');
const { removeCustomer } = require('./components/Customer/removeCustomer');
const { updateCustomer } = require('./components/Customer/updateCustomer');

//Staff
const { listStaff } = require('./components/Staff/listStaff');
const { updateBooking } = require('./components/Booking/updateBooking');
const { removeBooking } = require('./components/Booking/removeBooking');

//////////////////
const app = express();
app.use(express.json());
app.use(cors());
//////////////////


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


//Hotel(Property) routes
app.post('/api/hotel', createProperty);

//Customer
app.post('/customer/create', createCustomer);
app.get('/customer/list', listAllCustomers);
app.delete('/customer/delete/:customerId', removeCustomer);
app.put('/customer/update/:customerId', updateCustomer);

//Staff
app.get('/api/staff/list/:hotelId', listStaff);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));