const bookingService = require("../services/bookingService");
const assignmentService = require("../services/assignmentService");
const driverSelectionService = require("../services/driverSelectionService");
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

const nearbyDrivers = async (req, res, next) => {
  try {
    const { pickupLat, pickupLng } = req.query;
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return sendError(res, "Booking not found.", 404);

    if (!pickupLat || !pickupLng) {
      return sendError(res, "pickupLat and pickupLng query params are required.", 400);
    }

    const excludeIds = (booking.rejectedBy || []).map((id) => id.toString());
    console.log(`[Booking ${req.params.id}] Fetching nearby drivers for ${booking.customerName} in ${booking.city}, ${excludeIds.length} excluded`);
    const drivers = await driverSelectionService.getPrioritizedDrivers(
      booking.city,
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      excludeIds
    );

    sendSuccess(res, { booking, drivers }, "Nearby drivers fetched.");
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { status, city, date, search } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (date) filters.date = date;
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

module.exports = { create, assign, unassign, accept, reject, updateStatus, complete, cancel, nearbyDrivers, list, listCities };
