const bookingRepo = require("../repositories/bookingRepository");
const userRepo = require("../repositories/userRepository");
const notificationService = require("./notificationService");
const { BookingStatus } = require("../utils/constants");
const { NotFoundError, ValidationError } = require("../utils/errors");

const createBooking = async (data) => {
  const { journeyStart } = data;

  if (new Date(journeyStart) < new Date())
    throw new ValidationError("Booking cannot be in the past.");

  const booking = await bookingRepo.create({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    pickupAddress: data.pickupAddress,
    dropAddress: data.dropAddress,
    journeyStart: data.journeyStart,
    city: data.city,
    vehicleCategory: data.vehicleType || data.vehicleCategory,
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

  const dId = booking.driverId?._id ?? booking.driverId;
  if (dId) await userRepo.updateUser(dId, { driverStatus: "available" });

  const now = new Date();
  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Completed,
    completedAt: now,
    journeyEnd: now,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-completed", populated);
  return populated;
};

const getBookingById = async (id) => bookingRepo.findById(id);

const getCities = async (user) => {
  if (user.role === "manager") return [user.city];
  return bookingRepo.distinctCities();
};

module.exports = { createBooking, getBookings, getBookingById, completeBooking, getCities };
