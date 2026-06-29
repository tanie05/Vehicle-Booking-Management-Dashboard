const Booking = require("../models/Booking");

const create = (data) => Booking.create(data);

const findById = (id) => Booking.findById(id);

const findBookings = (filters) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.city) query.city = filters.city;
  if (filters.driverId) query.driverId = filters.driverId;

  if (filters.today) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query.journeyStart = { $gte: start, $lte: end };
  }

  if (filters.yesterday) {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
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
    .populate("driverId", "name email phone vehicleNumber")
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 });
};

const updateBooking = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { returnDocument: "after" });

const distinctCities = () => Booking.distinct("city");

module.exports = { create, findById, findBookings, updateBooking, distinctCities };
