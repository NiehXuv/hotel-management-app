const { database } = require("../config/firebaseconfig");
const { ref, get } = require("firebase/database");

async function listStaff(req, res) {
    try {
        const { hotelId } = req.params; // Get hotelId from URL path

        // Validate hotelId
        if (!hotelId || typeof hotelId !== "string" || hotelId.trim() === "") {
            return res.status(400).json({ error: "hotelId is required and must be a non-empty string" });
        }

        // Query the Staff node (top-level)
        const staffRef = ref(database, "Staff");
        const snapshot = await get(staffRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "No staff found" });
        }

        const staffData = snapshot.val();
        let staffList = Object.keys(staffData)
            .map(key => ({
                id: key, // This is the lowercase Name (e.g., "john")
                name: staffData[key].Name || key, // Use the actual Name (e.g., "John")
                ...staffData[key]
            }))
            .filter(staff => staff.HotelId === hotelId); // Filter by HotelID

        if (staffList.length === 0) {
            return res.status(404).json({ error: `No staff found for hotelId: ${hotelId}` });
        }

        // Return only the fields needed by the frontend
        const formattedStaffList = staffList.map(staff => ({
            id: staff.id, // e.g., "john"
            name: staff.name // e.g., "John"
        }));

        return res.json(formattedStaffList);
    } catch (error) {
        console.error("Error fetching staff:", error);
        return res.status(500).json({ error: "Failed to fetch staff" });
    }
}

module.exports = { listStaff };