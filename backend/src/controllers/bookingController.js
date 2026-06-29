const bookingService = require("../services/bookingService");
const userRepo = require("../repositories/userRepository");
const { sendSuccess, sendError } = require("../utils/response");

const create = async (req, res, next) => {
  try {
    const { customerName, customerPhone, pickupLocation, dropLocation, city, bookingTime } = req.body;
    if (!customerName || !customerPhone || !pickupLocation || !dropLocation || !city || !bookingTime) {
      return sendError(res, "All fields are required: customerName, customerPhone, pickupLocation, dropLocation, city, bookingTime.", 400);
    }
    const booking = await bookingService.createBooking(req.body, req.user.id);
    sendSuccess(res, booking, "Booking created.", 201);
  } catch (err) {
    next(err);
  }
};

const assign = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    if (!driverId) {
      return sendError(res, "driverId is required.", 400);
    }
    const booking = await bookingService.assignBooking(
      req.params.id,
      driverId,
      req.user.id,
      req.user.city,
      req.user.role
    );
    sendSuccess(res, booking, "Booking assigned.");
  } catch (err) {
    next(err);
  }
};

const unassign = async (req, res, next) => {
  try {
    const booking = await bookingService.unassignBooking(
      req.params.id,
      req.user.id,
      req.user.city,
      req.user.role
    );
    sendSuccess(res, booking, "Booking unassigned.");
  } catch (err) {
    next(err);
  }
};

const complete = async (req, res, next) => {
  try {
    const booking = await bookingService.completeBooking(req.params.id, req.user.id);
    sendSuccess(res, booking, "Booking completed.");
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      reason
    );
    sendSuccess(res, booking, "Booking cancelled.");
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { status, city, today, yesterday, bookingDate } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (today) filters.today = true;
    if (yesterday) filters.yesterday = true;
    if (bookingDate) filters.bookingDate = bookingDate;

    const bookings = await bookingService.getBookings(filters, req.user);
    sendSuccess(res, bookings, "Bookings fetched.");
  } catch (err) {
    next(err);
  }
};

const listDrivers = async (req, res, next) => {
  try {
    const { city, availability } = req.query;
    let drivers;
    if (availability === "true") {
      drivers = await userRepo.findAvailableDrivers(city);
    } else {
      const filter = { role: "driver", isActive: true };
      if (city) filter.city = city;
      drivers = await userRepo.findAvailableDrivers(city); // same query should work
    }
    sendSuccess(res, drivers, "Drivers fetched.");
  } catch (err) {
    next(err);
  }
};

module.exports = { create, assign, unassign, complete, cancel, list, listDrivers };
