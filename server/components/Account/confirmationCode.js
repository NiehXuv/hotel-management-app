const { database } = require("../config/firebaseconfig");
const { ref, set, get, update } = require("firebase/database");

async function storeConfirmationCode(req, res) {
  const { username, confirmationCode, expirationTime } = req.body;

  try {
    const userRef = ref(database, `Users/${username}/confirmation`);
    await set(userRef, {
      code: confirmationCode,
      expirationTime,
      used: false
    });
    res.status(200).send("Confirmation code stored successfully");
  } catch (error) {
    console.error("Error storing confirmation code:", error);
    res.status(500).send("Internal server error");
  }
}

async function verifyConfirmationCode(req, res) {
  const { username, code } = req.body;

  try {
    const userRef = ref(database, `Users/${username}/confirmation`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return res.status(400).json({ error: 'No confirmation code found' });
    }

    const confirmationData = snapshot.val();
    const currentTime = Date.now();

    if (confirmationData.used || 
        confirmationData.expirationTime < currentTime || 
        confirmationData.code !== code) {
      return res.status(400).json({ error: 'Invalid or expired confirmation code' });
    }

    // Mark code as used
    await update(userRef, { used: true });
    res.status(200).json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error("Error verifying confirmation code:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendConfirmationEmail(req, res) {
  try {
    const { email, confirmationCode, username } = req.body;

    // Generate a 6-digit confirmation code (already provided in request)
    const expirationTime = Date.now() + 15 * 60 * 1000;

    // Store the confirmation code in the user's record
    console.log('Storing confirmation code for user:', username);
    await update(ref(database, `Users/${username}/confirmation`), {
      code: confirmationCode,
      expirationTime: expirationTime,
      used: false,
    });

    // Schedule deletion of the confirmation code after 15 minutes
    setTimeout(async () => {
      console.log('Deleting confirmation code for user:', username);
      await update(ref(database, `Users/${username}/confirmation`), {
        code: null,
        expirationTime: null,
        used: null,
      });
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Send email using Resend with fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Account Creation Confirmation - Heart of Hoan Kiem',
        html: `
          <h1>Account Creation Confirmation</h1>
          <p>Your confirmation code is: <strong>${confirmationCode}</strong></p>
          <p>Please use this code to complete your account creation. This code will expire in 15 minutes.</p>
          <p>If you did not request an account, please ignore this email.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    res.status(200).json({ message: 'Confirmation code sent', email, username });
  } catch (err) {
    console.error('Error sending confirmation email:', err.message);
    res.status(500).json({ error: err.message || 'Failed to send confirmation email' });
  }
}

module.exports = { 
  storeConfirmationCode, 
  verifyConfirmationCode, 
  sendConfirmationEmail 
};