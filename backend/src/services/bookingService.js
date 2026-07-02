const bookingRepo = require("../repositories/bookingRepository");
const scheduleService = require("./scheduleService");
const notificationService = require("./notificationService");
const { BookingStatus } = require("../utils/constants");
const { NotFoundError, ValidationError } = require("../utils/errors");

const createBooking = async (data) => {
  const { journeyStart, journeyEnd } = data;

  if (new Date(journeyStart) >= new Date(journeyEnd))
    throw new ValidationError("journeyStart must be before journeyEnd.");

  if (new Date(journeyStart) < new Date())
    throw new ValidationError("Booking cannot be in the past.");

  const booking = await bookingRepo.create({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    pickupAddress: data.pickupAddress,
    dropAddress: data.dropAddress,
    journeyStart: data.journeyStart,
    journeyEnd: data.journeyEnd,
    city: data.city,
    status: BookingStatus.Pending,
  });

  const populated = await bookingRepo.findById(booking._id);
  notificationService.emitBookingEvent("booking-created", populated);
  return populated;
};

const getBookings = async (filters, user) => {
  const query = { ...filters };

  if (user.role === "manager") {
    query.city = user.city;
  } else if (user.role === "driver") {
    query.driverId = user.id;
  }

  return bookingRepo.findBookings(query);
};

const completeBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.TripInProgress)
    throw new ValidationError("Only trips in progress can be completed.");

  await scheduleService.removeSchedule(bookingId);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Completed,
    completedAt: new Date(),
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-completed", populated);
  return updated;
};

const getCities = async (user) => {
  if (user.role === "manager") return [user.city];
  return bookingRepo.distinctCities();
};

module.exports = { createBooking, getBookings, completeBooking, getCities };
