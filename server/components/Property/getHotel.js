const { database } = require('../config/firebaseconfig');
const { ref, get } = require('firebase/database');

const getHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotelRef = ref(database, `Hotel/${hotelId}`);
    const snapshot = await get(hotelRef);

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found',
      });
    }

    const hotelData = snapshot.val();
    return res.status(200).json({
      success: true,
      data: {
        hotelId,
        Name: hotelData.Name,
        Description: hotelData.Description,
        Location: hotelData.Location,
        Email: hotelData.Email,
        PhoneNumber: hotelData.PhoneNumber,
      },
      message: 'Hotel retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching hotel:', {
      error: error.message,
      stack: error.stack,
      hotelId: req.params.hotelId,
    });
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

module.exports = { getHotel };