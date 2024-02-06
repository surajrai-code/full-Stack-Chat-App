const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const fs=require('fs')
const dotenv = require("dotenv");
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const notifyAboutOnlinePeople = (wss) => {
  const onlineUsers = [...wss.clients].map((client) => ({
    userId: client.userId,
    username: client.username,
  }));
  const onlineUsersMessage = JSON.stringify({ online: onlineUsers });

  // Broadcast online users to all connected clients
  wss.clients.forEach((client) => {
    client.send(onlineUsersMessage);
  });
};

exports.handleWebSocketConnections = (wss) => {
  wss.on("connection", (connection, req) => {
    connection.isAlive = true;

    connection.on("pong", () => {
      connection.isAlive = true;
    });

    connection.on("message", async (message) => {
      try {
        const messageData = JSON.parse(message.toString());
        const { recipient, text, file } = messageData;
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
          sender: connection.userId,
          recipient,
          text,
          file: file ? filename : null,
        });
        const broadcastMessage = JSON.stringify({
          text,
          sender: connection.userId,
          recipient,
          file: file ? filename : null,
          _id: messageDoc._id,
        });

        // Broadcast the message to appropriate recipient
        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            client.send(broadcastMessage);
          });
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    // Authenticate WebSocket connection
    const cookies = req.headers.cookie;
   
    if (cookies) {
      const tokenCookieString = cookies.split(";").find((str) => str.trim().startsWith("token="));
      if (tokenCookieString) {
        const token = tokenCookieString.split("=")[1];
        if (token) {
          jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) {
              console.error("WebSocket authentication failed:", err);
              connection.terminate();
              return;
            }
            const { userId, username } = userData;
            connection.userId = userId;
            connection.username = username;

            // Notify about online people when someone connects
            notifyAboutOnlinePeople(wss);
          });
        }
      }
    }

    connection.on("close", () => {
      // Notify about online people when someone disconnects
      notifyAboutOnlinePeople(wss);
    });

    // Ping-pong to check client connectivity
    setInterval(() => {
      if (connection.isAlive === false) {
        return connection.terminate();
      }
      connection.isAlive = false;
      connection.ping();
    }, 30000);
  });
};
