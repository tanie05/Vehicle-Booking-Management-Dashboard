const jwt = require("jsonwebtoken");
const config = require("../config");
const { sendError } = require("../utils/response");
const { matchRoute } = require("../config/permissions");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, "Access denied. No token provided.", 401);
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    sendError(res, "Invalid or expired token.", 401);
  }
};

const checkPermission = (req, res, next) => {
  const fullPath = (req.baseUrl + req.path).replace(/\/+$/, "") || "/";
  const allowedRoles = matchRoute(req.method, fullPath);
  if (!allowedRoles) {
    return sendError(res, "Route not found or no permission defined.", 404);
  }
  if (!allowedRoles.includes(req.user.role)) {
    return sendError(res, "You do not have permission to perform this action.", 403);
  }
  next();
};

module.exports = { authenticate, checkPermission };
