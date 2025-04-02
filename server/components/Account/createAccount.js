const { database } = require("../config/firebaseconfig");
const { ref, set } = require("firebase/database");
const bcrypt = require("bcrypt");

async function createAccount(req, res) {
  const { username, password, email, phoneNumber, role, hotelId } = req.body;

  // Check if all required fields are present
  if (!username || !password || !email || !phoneNumber || !role || !hotelId) {
    return res.status(400).json({ error: "All fields including hotelId are required" });
  }

  // Define valid roles
  const validRoles = ["boss", "sales", "receptionist"];
  
  // Validate role
  if (!validRoles.includes(role.toLowerCase())) {
    return res.status(400).json({ error: "Invalid role. Must be one of: boss, sales, receptionist" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Reference to the user in the Users node
    const userRef = ref(database, `Users/${username}`);
    
    // Reference to the staff in the Staff node
    const staffRef = ref(database, `Staff/${username}`);

    // Add user to Users node with hotelId
    await set(userRef, {
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      role: role.toLowerCase(),
      hotelId // Add hotelId to the user
    });

    // Automatically add user to Staff node with the same hotelId
    await set(staffRef, {
      Email: email,
      HotelId: hotelId,
      Name: username, // Using username as the name; adjust if you have a separate name field
      PhoneNumber: phoneNumber,
      Role: role.toLowerCase()
    });

    // Ensure the response is valid JSON
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { createAccount };