const { database } = require("../config/firebaseconfig");
const { ref, update, get, query, orderByChild, equalTo } = require("firebase/database");
const bcrypt = require("bcrypt");
async function resetPassword(req, res) {
  try {
    const { email, username, code, newPassword } = req.body;

    // Verify the username matches the email
    const userRef = ref(database, `Users/${username}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.val();
    if (userData.email !== email) {
      return res.status(400).json({ error: 'Email and username do not match' });
    }

    // Check if the reset code exists and is valid
    if (!userData.resetCode || !userData.expirationTime || userData.used) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const currentTime = Date.now();
    if (userData.expirationTime < currentTime || userData.resetCode !== code) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password in the Realtime Database
    await update(userRef, {
      password: hashedPassword, // Update the password field in Realtime Database
      used: true, // Mark the reset code as used
      resetCode: null, // Clear the reset code
      expirationTime: null, // Clear the expiration time
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

module.exports = { resetPassword };