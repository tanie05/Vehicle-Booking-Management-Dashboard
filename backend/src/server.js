const http = require("http");
const app = require("./app");
const config = require("./config");
const connectDB = require("./config/db");
const { setupSocket } = require("./socket");
const { checkStaleAssignments } = require("./services/assignmentService");

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  setupSocket(server);

  setInterval(async () => {
    try {
      const count = await checkStaleAssignments(config.assignmentTimeoutMinutes);
      if (count > 0) {
        console.log(`Timed out ${count} stale assignment(s).`);
      }
    } catch (err) {
      console.error("Timeout check error:", err.message);
    }
  }, 30 * 1000);

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
