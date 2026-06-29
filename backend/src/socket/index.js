const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { setIO } = require("../services/notificationService");

let io;

const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setIO(io);

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

module.exports = { setupSocket };
