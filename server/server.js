const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const { sendResetEmail } = require('./components/Account/sendresetemail');
const { resetPassword } = require('./components/Account/resetpassword');
const { listAllBookings } = require('./components/Booking/listAllBooking');

//Room functions
const { createRoom, getHotelIds } = require("./components/Room/createRoom");


const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/send-reset-email', sendResetEmail);
app.post('/api/reset-password', resetPassword);
app.get('/booking/list', listAllBookings);

//Room api
app.get('/api/hotels/ids', getHotelIds);
app.post('/api/rooms/:hotelId', createRoom);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
