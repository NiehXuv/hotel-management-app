const { database } = require("../config/firebaseconfig");
const { ref, update, get, query, orderByChild, equalTo } = require("firebase/database");
const axios = require('axios');

async function sendResetEmail(req, res) {
  try {
    const { email } = req.body;

    // Find the user by email in the Realtime Database
    const usersRef = ref(database, 'Users');
    const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the username (key) of the user
    let username;
    snapshot.forEach((childSnapshot) => {
      username = childSnapshot.key; // e.g., "hienvu"
    });

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (15 minutes from now)
    const expirationTime = Date.now() + 15 * 60 * 1000;

    // Store the reset code in the user's record in Realtime Database
    console.log('Storing reset code for user:', username);
    await update(ref(database, `Users/${username}`), {
      resetCode: resetCode,
      expirationTime: expirationTime,
      used: false,
    });
     // Schedule deletion of the reset code after 15 minutes
     setTimeout(async () => {
        console.log('Deleting reset code for user:', username);
        await update(ref(database, `Users/${username}`), {
          resetCode: null,
          expirationTime: null,
          used: null,
        });
      }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Send email using Resend
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Password Reset Code - Heart of Hoan Kiem',
        html: `
          <h1>Password Reset Request</h1>
          <p>Your password reset code is: <strong>${resetCode}</strong></p>
          <p>Please use this code to reset your password. This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
      }
    );

    console.log('Email sent successfully:', response.data);
    res.status(200).json({ message: 'Reset code sent', email, username });
  } catch (err) {
    console.error('Error sending email:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.message || 'Failed to send reset email' });
  }
}

module.exports = { sendResetEmail };