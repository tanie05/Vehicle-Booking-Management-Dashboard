const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const userRepo = require("../repositories/userRepository");
const { ConflictError, UnauthorizedError, ValidationError } = require("../utils/errors");
const { validateEmail, validateStrongPassword } = require("../utils/validators");

const signup = async ({ name, email, password, phone, city, role }) => {
  validateEmail(email);
  validateStrongPassword(password);

  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError("Email already registered.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    phone,
    role: role || "customer",
    ...(city && { city }),
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, city: user.city },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city },
  };
};

const login = async ({ email, password }) => {
  validateEmail(email);

  const user = await userRepo.findByEmail(email);
  if (!user) throw new UnauthorizedError("Invalid email or password.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Invalid email or password.");

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, city: user.city },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city },
  };
};

module.exports = { signup, login };
