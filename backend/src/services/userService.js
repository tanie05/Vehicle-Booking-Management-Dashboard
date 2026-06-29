const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/userRepository");
const { Role } = require("../utils/constants");
const { ConflictError, NotFoundError, ValidationError } = require("../utils/errors");
const { validateEmail, validateStrongPassword } = require("../utils/validators");

const createUser = async ({ name, email, password, phone, city, role }) => {
  const allowedRoles = [Role.Customer, Role.Driver];
  const targetRole = role || Role.Customer;
  if (!allowedRoles.includes(targetRole))
    throw new ValidationError("Only customer or driver accounts can be created.");

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
    role: targetRole,
    ...(city && { city }),
  });

  return { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city };
};

const updateRole = async (userId, newRole) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const hierarchy = [Role.Customer, Role.Driver, Role.Manager, Role.Admin];
  const currentIdx = hierarchy.indexOf(user.role);
  const targetIdx = hierarchy.indexOf(newRole);

  if (currentIdx === -1 || targetIdx === -1)
    throw new ValidationError("Invalid role for promotion.");
  if (targetIdx <= currentIdx)
    throw new ValidationError("Can only promote to a higher role.");

  const updated = await userRepo.updateUser(userId, { role: newRole });

  return { id: updated._id, name: updated.name, email: updated.email, role: updated.role, city: updated.city };
};

module.exports = { createUser, updateRole };
