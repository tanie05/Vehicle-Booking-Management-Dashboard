const scheduleRepo = require("../repositories/scheduleRepository");
const { NotFoundError } = require("../utils/errors");

const checkAvailability = async (driverId, from, to) => {
  const overlap = await scheduleRepo.findOverlapping(driverId, from, to);
  return !overlap;
};

const createSchedule = async (driverId, bookingId, from, to) =>
  scheduleRepo.create({ driverId, bookingId, from, to });

const removeSchedule = async (bookingId) => {
  const schedule = await scheduleRepo.deleteByBookingId(bookingId);
  return schedule;
};

module.exports = { checkAvailability, createSchedule, removeSchedule };
