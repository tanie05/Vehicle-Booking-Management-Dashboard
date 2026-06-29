const { ValidationError } = require("./errors");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const validateEmail = (email) => {
  if (!email || !EMAIL_REGEX.test(email))
    throw new ValidationError("Invalid email format.");
};

const validateStrongPassword = (password) => {
  if (!password || !PASSWORD_REGEX.test(password))
    throw new ValidationError("Password must be at least 8 characters with uppercase, lowercase, and a number.");
};

module.exports = { validateEmail, validateStrongPassword };
