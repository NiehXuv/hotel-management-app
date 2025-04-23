const { database } = require("../config/firebaseconfig");
const { ref, set, get, push } = require("firebase/database");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chat = async (req, res) => {
    try {
        const { userId, message, category } = req.body;

        // Validate input
        if (!userId || !message || !category) {
            return res.status(400).json({
                success: false,
                error: "userId, message, and category are required",
            });
        }

        // Validate category
        const validCategories = [
            "Booking",
            "Counters",
            "Customer",
            "Hotel",
            "Notifications",
            "Payment",
            "Staff",
            "Users",
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
            });
        }

        // Fetch data from Realtime Database based on the category
        const dataRef = ref(database, category);
        const dataSnapshot = await get(dataRef);
        let context = `Category: ${category}\n`;
        if (dataSnapshot.exists()) {
            const data = dataSnapshot.val();
            context += `Data:\n${JSON.stringify(data, null, 2)}`;
        } else {
            context += `No data found for category ${category}.`;
        }

        // Fetch previous chat messages for conversation history
        const messagesRef = ref(database, `Chat/${userId}/Messages`);
        const messagesSnapshot = await get(messagesRef);
        const conversationHistory = [];

        // Add the system instruction as the first user message
        conversationHistory.push({
            role: "user",
            parts: [
                {
                    text: `You are a hotel assistant helping users with information from a hotel management app. Use the provided data to answer questions accurately.\n\n${context}`,
                },
            ],
        });
        conversationHistory.push({
            role: "model",
            parts: [
                {
                    text: "Understood! I'm ready to assist with the information provided.",
                },
            ],
        });

        // Add previous messages from the current category
        if (messagesSnapshot.exists()) {
            messagesSnapshot.forEach((child) => {
                const msg = child.val();
                // Only include messages from the current category
                if (msg.category === category) {
                    conversationHistory.push({ role: "user", parts: [{ text: msg.prompt }] });
                    if (msg.response) {
                        conversationHistory.push({ role: "model", parts: [{ text: msg.response }] });
                    }
                }
            });
        }

        // Add the new user message
        conversationHistory.push({ role: "user", parts: [{ text: message }] });

        // Call Gemini API to generate a response with fixed maxOutputTokens
        const result = await model.generateContent({
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200, // Fixed value, adjust as needed
            },
        });
        const responseText = result.response.text();

        // Store the message and response in Realtime Database
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, {
            prompt: message,
            response: responseText,
            category,
            createTime: new Date().toISOString(),
        });

        return res.status(200).json({
            success: true,
            message: "Chat message processed successfully",
            response: responseText,
        });
    } catch (error) {
        console.error("Error processing chat message:", {
            error: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// Endpoint to fetch chat messages for a user
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "userId is required",
            });
        }

        const messagesRef = ref(database, `Chat/${userId}/Messages`);
        const messagesSnapshot = await get(messagesRef);
        const messages = [];
        if (messagesSnapshot.exists()) {
            messagesSnapshot.forEach((child) => {
                const msg = child.val();
                messages.push({
                    id: child.key,
                    prompt: msg.prompt || "",
                    response: msg.response || "",
                    category: msg.category || "",
                    createTime: msg.createTime || new Date().toISOString(),
                });
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chat messages retrieved successfully",
            messages: messages,
        });
    } catch (error) {
        console.error("Error fetching chat messages:", {
            error: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// Endpoint to clear chat messages for a user and category
const clearChat = async (req, res) => {
    try {
        const { userId, category } = req.params;

        if (!userId || !category) {
            return res.status(400).json({
                success: false,
                error: "userId and category are required",
            });
        }

        // Validate category
        const validCategories = [
            "Booking",
            "Counters",
            "Customer",
            "Hotel",
            "Notifications",
            "Payment",
            "Staff",
            "Users",
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
            });
        }

        // Fetch current messages
        const messagesRef = ref(database, `Chat/${userId}/Messages`);
        const messagesSnapshot = await get(messagesRef);

        if (!messagesSnapshot.exists()) {
            return res.status(200).json({
                success: true,
                message: "No messages to clear",
            });
        }

        // Filter out messages for the specified category
        const messagesToKeep = {};
        messagesSnapshot.forEach((child) => {
            const msg = child.val();
            if (msg.category !== category) {
                messagesToKeep[child.key] = msg;
            }
        });

        // Overwrite the messages node with the filtered messages
        await set(messagesRef, messagesToKeep);

        return res.status(200).json({
            success: true,
            message: `Chat messages for category ${category} cleared successfully`,
        });
    } catch (error) {
        console.error("Error clearing chat messages:", {
            error: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

module.exports = { chat, getMessages, clearChat };