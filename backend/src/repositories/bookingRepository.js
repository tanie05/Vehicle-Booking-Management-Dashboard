const Booking = require("../models/Booking");

const create = (data) => Booking.create(data);

const findById = (id) =>
  Booking.findById(id)
    .populate("driverId", "name email phone vehicleNumber vehicleModel seatingCapacity vehicleCategory driverStatus")
    .populate("assignedBy", "name email");

const findBookings = (filters) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.city) query.city = filters.city;
  if (filters.driverId) query.driverId = filters.driverId;

  if (filters.date) {
    const start = new Date(filters.date + "T00:00:00");
    const end = new Date(filters.date + "T23:59:59");
    query.journeyStart = { $gte: start, $lte: end };
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [
      { customerName: regex },
      { customerPhone: regex },
      { pickupAddress: regex },
      { dropAddress: regex },
    ];
  }

  return Booking.find(query)
    .populate("driverId", "name email phone vehicleNumber vehicleModel seatingCapacity vehicleCategory driverStatus")
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 });
};

const updateBooking = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { returnDocument: "after" });

const findStaleAssignments = (cutoff) =>
  Booking.find({
    status: "driver_assigned",
    assignedAt: { $lt: cutoff },
  });

const distinctCities = () => Booking.distinct("city");

module.exports = { create, findById, findBookings, updateBooking, findStaleAssignments, distinctCities };
