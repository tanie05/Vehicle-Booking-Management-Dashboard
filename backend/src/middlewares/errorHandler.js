const { AppError } = require("../utils/errors");
const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  console.error("Unhandled error:", err);
  sendError(res, "Internal server error", 500);
};

module.exports = errorHandler;
