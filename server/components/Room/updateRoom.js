const { database } = require('../config/firebaseconfig');
const { ref, get, update } = require('firebase/database');

const updateRoom = async (req, res) => {
  try {
    const { hotelId, roomNumber } = req.params;
    const { RoomName, Description, PriceByDay, PriceByNight, PriceBySection } = req.body;

    // Check if room exists
    const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }

    // Prepare update object with only provided fields
    const updates = {
      UpdatedAt: new Date().toISOString(),
    };

    // Validation for optional fields if provided
    if (RoomName !== undefined) {
      if (typeof RoomName !== 'string' || RoomName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'RoomName must be a string with at least 2 characters',
        });
      }
      updates.RoomName = RoomName.trim();
    }

    if (Description !== undefined) {
      if (typeof Description !== 'string' || Description.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Description must be a string with at least 10 characters',
        });
      }
      updates.Description = Description.trim();
    }

    if (PriceByDay !== undefined) {
      if (isNaN(Number(PriceByDay)) || Number(PriceByDay) < 0) {
        return res.status(400).json({
          success: false,
          error: 'PriceByDay must be a non-negative number',
        });
      }
      updates.PriceByDay = Number(PriceByDay);
    }

    if (PriceByNight !== undefined) {
      if (isNaN(Number(PriceByNight)) || Number(PriceByNight) < 0) {
        return res.status(400).json({
          success: false,
          error: 'PriceByNight must be a non-negative number',
        });
      }
      updates.PriceByNight = Number(PriceByNight);
    }

    if (PriceBySection !== undefined) {
      if (isNaN(Number(PriceBySection)) || Number(PriceBySection) < 0) {
        return res.status(400).json({
          success: false,
          error: 'PriceBySection must be a non-negative number',
        });
      }
      updates.PriceBySection = Number(PriceBySection);
    }

    // If no fields to update were provided
    if (Object.keys(updates).length === 1) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must be provided to update',
      });
    }

    // Perform the update
    await update(roomRef, updates);

    // Fetch updated room data to return
    const updatedSnapshot = await get(roomRef);
    const updatedRoom = updatedSnapshot.val();

    return res.status(200).json({
      success: true,
      data: {
        hotelId,
        roomNumber,
        ...updatedRoom,
      },
      message: 'Room updated successfully',
    });
  } catch (error) {
    console.error('Error updating room:', {
      error: error.message,
      stack: error.stack,
      hotelId: req.params.hotelId,
      roomNumber: req.params.roomNumber,
    });
    const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

module.exports = { updateRoom };