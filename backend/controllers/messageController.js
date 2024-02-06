const Message = require("../models/Message");
const jwt=require('jsonwebtoken');
const dotenv = require("dotenv");
const fs=require('fs')
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

exports.fetchMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipient, text, file } = req.body;
    let filename = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + filename;
      const bufferData = new Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("File saved:", path);
      });
    }
    const messageDoc = await Message.create({
      sender: req.user.userId,
      recipient,
      text,
      file: file ? filename : null,
    });
    console.log("Message created:", messageDoc);
    res.status(201).json(messageDoc);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to extract user data from the request
async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) reject("Failed to verify token");
        resolve(userData);
      });
    } else {
      reject("No token found in cookies");
    }
  });
}
