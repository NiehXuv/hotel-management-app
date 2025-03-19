// components/Room/updateRoom.js
const { database } = require("../config/firebaseconfig");
const { ref, get, update } = require("firebase/database");

const updateRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber } = req.params;
        const { 
            name, 
            description, 
            pricebyDay, 
            pricebyNight, 
            pricebySection 
        } = req.body;

        // Check if room exists
        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomNumber}`);
        const roomSnapshot = await get(roomRef);
        
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Get existing room data
        const existingRoom = roomSnapshot.val();

        // Prepare update object with only provided fields
        const updates = {
            updatedAt: new Date().toISOString()
        };

        // Validation for optional fields if provided
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Name must be a string with at least 2 characters'
                });
            }
            updates.name = name.trim();
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Description must be a string with at least 10 characters'
                });
            }
            updates.description = description.trim();
        }

        if (pricebyDay !== undefined) {
            if (isNaN(Number(pricebyDay)) || Number(pricebyDay) < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Price by day must be a non-negative number'
                });
            }
            updates.pricebyDay = Number(pricebyDay);
        }

        if (pricebyNight !== undefined) {
            if (isNaN(Number(pricebyNight)) || Number(pricebyNight) < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Price by night must be a non-negative number'
                });
            }
            updates.pricebyNight = Number(pricebyNight);
        }

        if (pricebySection !== undefined) {
            if (isNaN(Number(pricebySection)) || Number(pricebySection) < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Price by section must be a non-negative number'
                });
            }
            updates.pricebySection = Number(pricebySection);
        }

        // If no fields to update were provided
        if (Object.keys(updates).length === 1) { // Only updatedAt
            return res.status(400).json({
                success: false,
                error: 'At least one field must be provided to update'
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
                ...updatedRoom
            },
            message: 'Room updated successfully'
        });

    } catch (error) {
        console.error('Error updating room:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.params.roomNumber
        });
        const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

module.exports = { updateRoom };