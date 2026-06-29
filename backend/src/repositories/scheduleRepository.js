const Schedule = require("../models/Schedule");

const findOverlapping = (driverId, from, to) =>
  Schedule.findOne({
    driverId,
    from: { $lt: to },
    to: { $gt: from },
  });

const findByDriverId = (driverId) =>
  Schedule.find({ driverId }).sort({ from: 1 });

const findByBookingId = (bookingId) =>
  Schedule.findOne({ bookingId });

const create = (data) => Schedule.create(data);

const deleteByBookingId = (bookingId) =>
  Schedule.findOneAndDelete({ bookingId });

module.exports = { findOverlapping, findByDriverId, findByBookingId, create, deleteByBookingId };
