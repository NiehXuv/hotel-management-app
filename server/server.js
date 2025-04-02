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
const { createRoom, getHotelIds, getRoomTypes } = require('./components/Room/createRoom');
const { updateRoomStatus } = require('./components/Room/updateRoomStatus');
const { updateRoom } = require('./components/Room/updateRoom');
const { listRooms } = require('./components/Room/listRooms');
const { deleteRoom } = require('./components/Room/deleteRoom');

// Hotel (Property) functions
const { createProperty } = require('./components/Property/createProperty');
const { listProperty } = require('./components/Property/listProperty');
const { updateProperty } = require('./components/Property/updateProperty');
const { deleteProperty } = require('./components/Property/deleteProperty');
const { showProperty } = require('./components/Property/showProperty');
// Customer
const { createCustomer } = require('./components/Customer/createCustomer');
const { listAllCustomers } = require('./components/Customer/listCustomer');
const { removeCustomer } = require('./components/Customer/removeCustomer');
const { updateCustomer } = require('./components/Customer/updateCustomer');


const { createActivity } = require('./components/Activity/createActivity');
const { updateActivity } = require('./components/Activity/updateActivity');
const { removeActivity } = require('./components/Activity/removeActivity');

const { createIssue } = require('./components/Issue/createIssue');
const { updateIssue } = require('./components/Issue/updateIssue');
const { removeIssue } = require('./components/Issue/removeIssue');


const { createEquipment } = require('./components/Equipment/createEquipment');
const { updateEquipment } = require('./components/Equipment/updateEquipment');
const { removeEquipment } = require('./components/Equipment/removeEquipment');

const { getNotifications } = require("./components/Notification/getNotifications");
const { deleteNotification } = require('./components/Notification/deleteNotification');
const { clearAllNotifications } = require('./components/Notification/deleteNotification');
// Staff
const { listStaff } = require('./components/Staff/listStaff.js');
const { financialReport } = require("./components/Reports/financialReport");
const { createAccount } = require('./components/Account/createAccount');
const { storeConfirmationCode, verifyConfirmationCode, sendConfirmationEmail } = require('./components/Account/confirmationCode');

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
app.post('/api/create-account', createAccount);
app.post('/api/store-confirmation-code', storeConfirmationCode);
app.post('/api/verify-confirmation-code', verifyConfirmationCode);
app.post('/api/send-confirmation-email', sendConfirmationEmail);


// Room routes
app.get('/api/hotels/ids', getHotelIds);
app.get('/api/hotel/:hotelId/roomTypes', getRoomTypes);
app.post('/api/rooms/:hotelId', createRoom);
app.put('/hotels/:hotelId/rooms/:roomNumber/status', updateRoomStatus);
app.put('/hotels/:hotelId/rooms/:roomNumber', updateRoom);
app.get('/api/hotels/:hotelId/rooms', listRooms);
app.delete('/hotels/:hotelId/rooms/:roomNumber', deleteRoom);

// Hotel (Property) routes
app.post('/api/hotel/create', createProperty);
app.get('/hotels', listProperty);
app.get('/hotels/:hotelId', showProperty); // New endpoint
app.put('/hotels/:hotelId', updateProperty);
app.delete('/hotels/:hotelId', deleteProperty);

// Customer
app.post('/customer/create', createCustomer);
app.get('/customer/list', listAllCustomers);
app.delete('/customer/delete/:customerId', removeCustomer);
app.put('/customer/update/:customerId', updateCustomer);


// Activity routes
app.post('/hotels/:hotelId/rooms/:roomNumber/activities', createActivity);
app.put('/hotels/:hotelId/rooms/:roomNumber/activities/:activityId', updateActivity);
app.delete('/hotels/:hotelId/rooms/:roomNumber/activities/:activityId', removeActivity);

// Issue routes
app.post('/hotels/:hotelId/rooms/:roomNumber/issues', createIssue);
app.put('/hotels/:hotelId/rooms/:roomNumber/issues/:issueId', updateIssue);
app.delete('/hotels/:hotelId/rooms/:roomNumber/issues/:issueId', removeIssue);

// Equipment routes
app.post('/hotels/:hotelId/rooms/:roomNumber/equipment', createEquipment);
app.put('/hotels/:hotelId/rooms/:roomNumber/equipment/:equipmentId', updateEquipment);
app.delete('/hotels/:hotelId/rooms/:roomNumber/equipment/:equipmentId', removeEquipment);

// Staff
app.get('/api/staff/list/:hotelId', listStaff);
// Notification route
app.get("/notifications", getNotifications);
app.delete("/notifications/:notificationId", deleteNotification);
app.delete("/notifications", clearAllNotifications);

app.get('/financial', financialReport);





// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));