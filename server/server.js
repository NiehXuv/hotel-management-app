const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sendResetEmail } = require('./components/Account/sendresetemail');
const { resetPassword } = require('./components/Account/resetpassword');
const { listAllBookings } = require('./components/Booking/listAllBooking');

// Room functions
const { createRoom, getHotelIds, listRoom, listAvailableRoom, deleteRoom, updateRoom } = require('./components/Room/roomController'); // Updated path

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Account and Booking routes
app.post('/api/send-reset-email', sendResetEmail);
app.post('/api/reset-password', resetPassword);
app.get('/booking/list', listAllBookings);

// Room routes
app.get('/api/hotels/ids', getHotelIds);
app.post('/api/rooms/:hotelId', createRoom);
app.get('/api/rooms/:hotelId', listRoom);
app.get('/api/rooms/:hotelId/available', listAvailableRoom);
app.delete('/api/rooms/:hotelId/:roomNumber', deleteRoom);
app.patch('/api/rooms/:hotelId/:roomNumber', updateRoom);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));