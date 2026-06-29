const User = require("../models/User");

const findByEmail = (email) => User.findOne({ email });

const findById = (id) => User.findById(id);

const findDrivers = (city) =>
  User.find({
    role: "driver",
    ...(city && { city }),
  });

const createUser = (data) => User.create(data);

const updateUser = (id, data) =>
  User.findByIdAndUpdate(id, data, { returnDocument: "after" });

module.exports = { findByEmail, findById, findDrivers, createUser, updateUser };
