const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

module.exports = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoURI: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "default-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleApiKey: process.env.GOOGLE_API_KEY || "",
  assignmentTimeoutMinutes: parseInt(process.env.ASSIGNMENT_TIMEOUT_MINUTES || "1", 10),
};
