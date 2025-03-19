const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config(); // Load environment variables

//Auth functions
const { sendResetEmail } = require('./components/Account/sendresetemail');
const { resetPassword } = require('./components/Account/resetpassword');
const { listAllBookings } = require('./components/Booking/listAllBooking');

// Room functions
const { createRoom, getHotelIds} = require('./components/Room/createRoom');
const { updateRoomStatus } = require('./components/Room/updateRoomStatus');
const { updateRoom } = require('./components/Room/updateRoom');
const { listRooms } = require('./components/Room/listRooms');


//Hotel(Property) functions
const { createProperty } = require('./components/Property/createProperty');

//////////////////
const app = express();
app.use(express.json());
app.use(cors());
//////////////////


// Account and Booking routes
app.post('/api/send-reset-email', sendResetEmail);
app.post('/api/reset-password', resetPassword);
app.get('/booking/list', listAllBookings);

// Room routes
app.get('/api/hotels/ids', getHotelIds);
app.post('/api/rooms/:hotelId', createRoom);
app.put('/hotels/:hotelId/rooms/:roomNumber/status', updateRoomStatus);
app.put('/hotels/:hotelId/rooms/:roomNumber', updateRoom);
app.get('/hotels/:hotelId/rooms', listRooms);


//Hotel(Property) routes
app.post('/api/hotel', createProperty);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));