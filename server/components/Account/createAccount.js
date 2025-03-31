const { database } = require("../config/firebaseconfig");
const { ref, set } = require("firebase/database");
const bcrypt = require("bcrypt");

async function createAccount(req, res) {
  const { username, password, email, phoneNumber, role } = req.body;

  // Check if all required fields are present
  if (!username || !password || !email || !phoneNumber || !role) {
    return res.status(400).send("All fields including role are required");
  }

  // Define valid roles
  const validRoles = ["boss", "sales", "receptionist"];
  
  // Validate role
  if (!validRoles.includes(role.toLowerCase())) {
    return res.status(400).send("Invalid role. Must be one of: boss, sales, receptionist");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRef = ref(database, `Users/${username}`);

    await set(userRef, {
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      role: role.toLowerCase() // Store role in lowercase for consistency
    });

    res.status(201).send("Account created successfully");
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { createAccount };