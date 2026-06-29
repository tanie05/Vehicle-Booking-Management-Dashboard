const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const userRepo = require("../repositories/userRepository");
const { ConflictError, UnauthorizedError, ValidationError } = require("../utils/errors");

const signup = async ({ name, email, password, role }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError("Email already registered.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role: role || "customer",
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

const createDriver = async ({ name, email, password, city }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError("Email already registered.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role: "driver",
    city,
    driverStatus: "available",
  });

  return { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city };
};

const createManager = async ({ name, email, password, city }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError("Email already registered.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role: "manager",
    city,
    isActive: true,
  });

  return { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city };
};

module.exports = { signup, login, createDriver, createManager };
