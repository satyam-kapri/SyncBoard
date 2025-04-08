const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {},
});

// Store active rooms and users
const activeRooms = new Map();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    console.log(`User ${username} joined Room: ${room}`);

    // Track users in rooms
    if (!activeRooms.has(room)) {
      activeRooms.set(room, new Set());
    }
    activeRooms.get(room).add(username);

    // Notify users in the room
    io.to(room).emit("receive_message", {
      type: "system",
      content: `${username} has joined the chat.`,
      timestamp: new Date().toISOString(),
    });

    // Send room info to the user
    socket.emit("room_info", {
      room,
      users: Array.from(activeRooms.get(room)),
      message: `Welcome to room ${room}`,
    });
  });

  socket.on("send_message", (data) => {
    const { sender, content, room, timestamp } = data;
    // Broadcast to all in room EXCEPT the sender
    socket.broadcast.to(room).emit("receive_message", {
      sender,
      content,
      timestamp,
      type: "user_message",
    });

    // Send back to just the sender (acknowledgement)
    socket.emit("receive_message", {
      sender: "You",
      content,
      timestamp,
      type: "my_message",
    });
  });

  socket.on("send_snap", (data) => {
    const { x, y, img, room, username } = data;
    socket.broadcast.to(room).emit("receive_snap", { img, x, y, username });
  });

  socket.on("typing", ({ room, username, isTyping }) => {
    socket.to(room).emit("typing", { username, isTyping });
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
    // Clean up room tracking
    activeRooms.forEach((users, room) => {
      if (users.has(socket.username)) {
        users.delete(socket.username);
        if (users.size === 0) {
          activeRooms.delete(room);
        } else {
          io.to(room).emit("receive_message", {
            type: "system",
            content: `${socket.username} has left the chat.`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  });
});

// Sanitize input function
function sanitizeInput(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

server.listen(3001, () => console.log("Server running on port 3001"));
