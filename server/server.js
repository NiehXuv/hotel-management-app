const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const { sendResetEmail } = require('./components/Account/sendresetemail');
const { resetPassword } = require('./components/Account/resetpassword');
const { listAllBookings } = require('./components/Booking/listAllBooking');
const { createRoom } = require("./components/Room/createRoom");


const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/send-reset-email', sendResetEmail);
app.post('/api/reset-password', resetPassword);
app.get('/booking/list', listAllBookings);

//Room
app.post("/api/hotel/:hotelId/room", createRoom);
app.get("/api/hotel/:hotelId/room", listRoom);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
