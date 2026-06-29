const Booking = require("../models/Booking");

const create = (data) => Booking.create(data);

const findById = (id) => Booking.findById(id);

const findBookings = (filters) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.city) query.city = filters.city;
  if (filters.driverRef) query.driverRef = filters.driverRef;
  if (filters.customerRef) query.customerRef = filters.customerRef;

  if (filters.today) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: start, $lte: end };
  }

  if (filters.yesterday) {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: start, $lte: end };
  }

  if (filters.bookingDate) {
    const date = new Date(filters.bookingDate);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    query.bookingTime = { $gte: start, $lte: end };
  }

  return Booking.find(query)
    .populate("driverRef", "name email")
    .populate("assignedBy", "name email")
    .populate("cancelledBy", "name email")
    .sort({ createdAt: -1 });
};

const updateBooking = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { returnDocument: "after" });

module.exports = { create, findById, findBookings, updateBooking };
