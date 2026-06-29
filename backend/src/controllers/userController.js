const userService = require("../services/userService");
const { sendSuccess, sendError } = require("../utils/response");

const create = async (req, res, next) => {
  try {
    const { name, email, password, phone, city, role } = req.body;
    if (!name || !email || !password || !city || !role) {
      return sendError(res, "name, email, password, city, and role are required.", 400);
    }
    const user = await userService.createUser({ name, email, password, phone, city, role });
    sendSuccess(res, user, "User created.", 201);
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return sendError(res, "role is required.", 400);
    }
    const user = await userService.updateRole(req.params.id, role);
    sendSuccess(res, user, "Role updated.");
  } catch (err) {
    next(err);
  }
};

module.exports = { create, updateRole };
