const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config");

let io;

const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = jwt.verify(token, config.jwtSecret);
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { role, city } = socket.user;

    if (role === "admin") {
      socket.join("admin");
    } else if (role === "manager" && city) {
      socket.join(city);
    }
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const emitBookingEvent = (event, booking) => {
  const adminRoom = "admin";
  const cityRoom = booking.city;

  io.to(adminRoom).emit(event, booking);
  if (cityRoom) {
    io.to(cityRoom).emit(event, booking);
  }
};

module.exports = { setupSocket, getIO, emitBookingEvent };
