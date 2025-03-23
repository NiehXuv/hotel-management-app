const { database } = require("../config/firebaseconfig");
const { ref, update } = require("firebase/database");

const updateProperty = async (req, res) => {
    try {
        const { hotelId } = req.params; // Extract hotelId from URL parameters
        const { Name, Description, Location, Email, PhoneNumber } = req.body; // Extract fields from request body

        // Validate that at least one field is provided to update
        if (!Name && !Description && !Location && !Email && !PhoneNumber) {
            return res.status(400).json({
                success: false,
                error: "No fields provided to update",
            });
        }

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const updates = {};

        // Only include fields that are provided in the request
        if (Name) updates.Name = Name;
        if (Description) updates.Description = Description;
        if (Location) updates.Location = Location;
        if (Email) updates.Email = Email;
        if (PhoneNumber) updates.PhoneNumber = PhoneNumber;

        // Perform the update in Firebase
        await update(hotelRef, updates);

        // Return the updated data
        return res.status(200).json({
            success: true,
            data: {
                hotelId,
                ...updates,
            },
            message: "Hotel updated successfully",
        });
    } catch (error) {
        console.error("Error updating hotel:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

module.exports = { updateProperty };