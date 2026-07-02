const bookingService = require("../services/bookingService");
const assignmentService = require("../services/assignmentService");
const { sendSuccess, sendError } = require("../utils/response");

const create = async (req, res, next) => {
  try {
    const { customerName, customerPhone, pickupAddress, dropAddress, city, journeyStart, journeyEnd } = req.body;
    if (!customerName || !customerPhone || !pickupAddress || !dropAddress || !city || !journeyStart || !journeyEnd) {
      return sendError(res, "All fields are required: customerName, customerPhone, pickupAddress, dropAddress, city, journeyStart, journeyEnd.", 400);
    }
    const booking = await bookingService.createBooking(req.body);
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
    const booking = await assignmentService.assignDriver(
      req.params.id, driverId, req.user.id, req.user.city, req.user.role
    );
    sendSuccess(res, booking, "Booking assigned.");
  } catch (err) {
    next(err);
  }
};

const unassign = async (req, res, next) => {
  try {
    const booking = await assignmentService.unassignDriver(
      req.params.id, req.user.id, req.user.city, req.user.role
    );
    sendSuccess(res, booking, "Booking unassigned.");
  } catch (err) {
    next(err);
  }
};

const accept = async (req, res, next) => {
  try {
    const booking = await assignmentService.acceptBooking(req.params.id, req.user.id);
    sendSuccess(res, booking, "Booking accepted.");
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await assignmentService.rejectBooking(req.params.id, req.user.id, reason);
    sendSuccess(res, booking, "Booking rejected.");
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return sendError(res, "status is required.", 400);
    const booking = await assignmentService.updateDriverStatus(req.params.id, req.user.id, status);
    sendSuccess(res, booking, "Status updated.");
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
    const reason = req.body?.reason || "";
    const booking = await assignmentService.cancelBooking(
      req.params.id, req.user.id, req.user.role, reason
    );
    sendSuccess(res, booking, "Booking cancelled.");
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { status, city, today, yesterday, search } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (today) filters.today = true;
    if (yesterday) filters.yesterday = true;
    if (search) filters.search = search;

    const bookings = await bookingService.getBookings(filters, req.user);
    sendSuccess(res, bookings, "Bookings fetched.");
  } catch (err) {
    next(err);
  }
};

const listCities = async (req, res, next) => {
  try {
    const cities = await bookingService.getCities(req.user);
    sendSuccess(res, cities, "Cities fetched.");
  } catch (err) {
    next(err);
  }
};

module.exports = { create, assign, unassign, accept, reject, updateStatus, complete, cancel, list, listCities };
