const bookingRepo = require("../repositories/bookingRepository");
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

  const bookings = await bookingRepo.findBookings(query);
  const now = new Date();

  return bookings.map((b) => {
    const booking = b.toObject();
    if (
      (booking.status === BookingStatus.Pending || booking.status === BookingStatus.Assigned) &&
      new Date(booking.journeyEnd) < now
    ) {
      booking.status = BookingStatus.Due;
    }
    return booking;
  });
};

const completeBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.Assigned)
    throw new ValidationError("Only assigned bookings can be completed.");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Completed,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-completed", populated);
  return updated;
};

const autoCompleteExpiredBookings = async () => {
  const now = new Date();
  const bookings = await bookingRepo.findBookings({
    status: BookingStatus.Assigned,
  });

  let completed = 0;
  for (const b of bookings) {
    if (b.status !== BookingStatus.Assigned) continue;
    if (new Date(b.journeyEnd) >= now) continue;

    await bookingRepo.updateBooking(b._id, { status: BookingStatus.Completed });
    const populated = await bookingRepo.findById(b._id);
    notificationService.emitBookingEvent("booking-completed", populated);
    completed++;
  }

  if (completed > 0) {
    console.log(`[Auto] ${completed} expired booking(s) auto-completed.`);
  }
};

const getCities = async (user) => {
  if (user.role === "manager") return [user.city];
  return bookingRepo.distinctCities();
};

module.exports = { createBooking, getBookings, completeBooking, autoCompleteExpiredBookings, getCities };
