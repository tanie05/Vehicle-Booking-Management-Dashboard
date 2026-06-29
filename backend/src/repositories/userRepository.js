const User = require("../models/User");

const findByEmail = (email) => User.findOne({ email, isActive: true });

const findById = (id) => User.findById(id);

const findAvailableDrivers = (city) =>
  User.find({
    role: "driver",
    driverStatus: "available",
    isActive: true,
    ...(city && { city }),
  });

const createUser = (data) => User.create(data);

const updateDriverStatus = (id, status) =>
  User.findByIdAndUpdate(id, { driverStatus: status }, { returnDocument: "after" });

module.exports = { findByEmail, findById, findAvailableDrivers, createUser, updateDriverStatus };
