const bookingRepo = require("../repositories/bookingRepository");
const userRepo = require("../repositories/userRepository");
const scheduleService = require("./scheduleService");
const notificationService = require("./notificationService");
const { BookingStatus } = require("../utils/constants");
const { NotFoundError, ValidationError } = require("../utils/errors");

const assignDriver = async (bookingId, driverId, userId, userCity, userRole) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.Pending)
    throw new ValidationError("Only pending bookings can be assigned.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only assign bookings in your city.");

  const driver = await userRepo.findById(driverId);
  if (!driver || driver.role !== "driver")
    throw new NotFoundError("Driver not found.");
  if (userRole === "manager" && driver.city !== userCity)
    throw new ValidationError("You can only assign drivers from your city.");

  if (booking.city !== driver.city)
    throw new ValidationError("Driver must be in the same city as the booking.");

  const available = await scheduleService.checkAvailability(
    driverId,
    booking.journeyStart,
    booking.journeyEnd
  );
  if (!available)
    throw new ValidationError("Driver is not available during this time slot.");

  await scheduleService.createSchedule(driverId, bookingId, booking.journeyStart, booking.journeyEnd);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Assigned,
    driverId,
    assignedBy: userId,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-assigned", populated);
  return updated;
};

const unassignDriver = async (bookingId, userId, userCity, userRole) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.Assigned)
    throw new ValidationError("Only assigned bookings can be unassigned.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only unassign bookings in your city.");

  await scheduleService.removeSchedule(bookingId);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Pending,
    driverId: null,
    assignedBy: null,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-unassigned", populated);
  return updated;
};

const cancelBooking = async (bookingId, userId, userRole, reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status === BookingStatus.Completed)
    throw new ValidationError("Completed bookings cannot be cancelled.");
  if (booking.status === BookingStatus.Cancelled)
    throw new ValidationError("Booking is already cancelled.");

  if (booking.status === BookingStatus.Assigned) {
    await scheduleService.removeSchedule(bookingId);
  }

  const updateData = { status: BookingStatus.Cancelled };

  const updated = await bookingRepo.updateBooking(bookingId, updateData);

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-cancelled", populated);
  return updated;
};

module.exports = { assignDriver, unassignDriver, cancelBooking };
