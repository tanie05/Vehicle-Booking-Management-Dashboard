const bookingRepo = require("../repositories/bookingRepository");
const userRepo = require("../repositories/userRepository");
const scheduleService = require("./scheduleService");
const notificationService = require("./notificationService");
const { BookingStatus } = require("../utils/constants");
const { NotFoundError, ValidationError } = require("../utils/errors");

const assignDriver = async (bookingId, driverId, userId, userCity, userRole) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");

  const validStatuses = [BookingStatus.Pending, BookingStatus.DriverRejected, BookingStatus.AssignmentTimeout];
  if (!validStatuses.includes(booking.status))
    throw new ValidationError("Booking cannot be assigned in its current status.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only assign bookings in your city.");

  const driver = await userRepo.findById(driverId);
  if (!driver || driver.role !== "driver")
    throw new NotFoundError("Driver not found.");
  if (userRole === "manager" && driver.city !== userCity)
    throw new ValidationError("You can only assign drivers from your city.");
  if (booking.city !== driver.city)
    throw new ValidationError("Driver must be in the same city as the booking.");

  const available = await scheduleService.checkAvailability(driverId, booking.journeyStart, booking.journeyEnd);
  if (!available)
    throw new ValidationError("Driver is not available during this time slot.");

  await scheduleService.removeSchedule(bookingId);
  await scheduleService.createSchedule(driverId, bookingId, booking.journeyStart, booking.journeyEnd);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.DriverAssigned,
    driverId,
    assignedBy: userId,
    assignedAt: new Date(),
    rejectionReason: null,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-assigned", populated);
  return updated;
};

const unassignDriver = async (bookingId, userId, userCity, userRole) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Only driver_assigned bookings can be unassigned.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only unassign bookings in your city.");

  await scheduleService.removeSchedule(bookingId);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Pending,
    driverId: null,
    assignedBy: null,
    assignedAt: null,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-unassigned", populated);
  return updated;
};

const acceptBooking = async (bookingId, driverId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Booking is not in assignable state.");
  if (booking.driverId?.toString() !== driverId)
    throw new ValidationError("You are not the assigned driver.");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.DriverAccepted,
    acceptedAt: new Date(),
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-accepted", populated);
  return updated;
};

const rejectBooking = async (bookingId, driverId, reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Booking is not in assignable state.");
  if (booking.driverId?.toString() !== driverId)
    throw new ValidationError("You are not the assigned driver.");

  await scheduleService.removeSchedule(bookingId);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.DriverRejected,
    rejectionReason: reason || "",
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-rejected", populated);
  return updated;
};

const STATUS_TRANSITIONS = {
  [BookingStatus.GoingToPickup]: { prev: BookingStatus.DriverAccepted, tsField: "goingToPickupAt", event: "booking-going-to-pickup" },
  [BookingStatus.DriverArrived]: { prev: BookingStatus.GoingToPickup, tsField: "arrivedAt", event: "booking-arrived" },
  [BookingStatus.CustomerOnboarded]: { prev: BookingStatus.DriverArrived, tsField: "onboardedAt", event: "booking-onboarded" },
  [BookingStatus.TripInProgress]: { prev: BookingStatus.CustomerOnboarded, tsField: "tripStartedAt", event: "booking-trip-started" },
};

const updateDriverStatus = async (bookingId, driverId, targetStatus) => {
  const transition = STATUS_TRANSITIONS[targetStatus];
  if (!transition) throw new ValidationError("Invalid status transition.");

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== transition.prev)
    throw new ValidationError(`Booking must be in ${transition.prev} status first.`);
  if (booking.driverId?.toString() !== driverId)
    throw new ValidationError("You are not the assigned driver.");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: targetStatus,
    [transition.tsField]: new Date(),
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent(transition.event, populated);
  return updated;
};

const timeoutAssignment = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Booking is not in assigned state.");

  await scheduleService.removeSchedule(bookingId);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.AssignmentTimeout,
    timedOutAt: new Date(),
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-timeout", populated);
  return updated;
};

const cancelBooking = async (bookingId, userId, userRole, reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status === BookingStatus.Completed)
    throw new ValidationError("Completed bookings cannot be cancelled.");
  if (booking.status === BookingStatus.Cancelled)
    throw new ValidationError("Booking is already cancelled.");

  const assignedStates = [
    BookingStatus.DriverAssigned, BookingStatus.DriverAccepted,
    BookingStatus.GoingToPickup, BookingStatus.DriverArrived,
    BookingStatus.CustomerOnboarded, BookingStatus.TripInProgress,
  ];
  if (assignedStates.includes(booking.status)) {
    await scheduleService.removeSchedule(bookingId);
  }

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Cancelled,
    cancelledAt: new Date(),
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-cancelled", populated);
  return updated;
};

const checkStaleAssignments = async (timeoutMinutes) => {
  const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
  const stale = await bookingRepo.findStaleAssignments(cutoff);
  for (const booking of stale) {
    await timeoutAssignment(booking._id);
  }
  return stale.length;
};

module.exports = {
  assignDriver, unassignDriver, acceptBooking, rejectBooking,
  updateDriverStatus,
  timeoutAssignment, cancelBooking, checkStaleAssignments,
};
