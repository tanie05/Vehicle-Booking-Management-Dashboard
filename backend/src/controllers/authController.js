const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/response");

const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role } = req.body;
    if (!name || !email || !password || !city) {
      return sendError(res, "Name, email, password, and city are required.", 400);
    }
    const result = await authService.signup({ name, email, password, phone, city, role: role || "customer" });
    sendSuccess(res, result, "Account created successfully.", 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400);
    }
    const result = await authService.login({ email, password });
    sendSuccess(res, result, "Login successful.");
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login };
