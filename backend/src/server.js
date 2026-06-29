const http = require("http");
const app = require("./app");
const config = require("./config");
const connectDB = require("./config/db");
const { setupSocket } = require("./socket");
const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  setupSocket(server);

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
