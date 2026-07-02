const bookingRepo = require("../repositories/bookingRepository");
const userRepo = require("../repositories/userRepository");
const notificationService = require("./notificationService");
const { BookingStatus } = require("../utils/constants");
const { NotFoundError, ValidationError } = require("../utils/errors");

const _setDriverBusy = (driverId, status) =>
  userRepo.updateUser(driverId, { driverStatus: status });

const assignDriver = async (bookingId, driverId, userId, userCity, userRole) => {
  console.log(`[Assign] ${userRole} ${userId} assigning driver ${driverId} to booking ${bookingId}`);
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

  if (booking.vehicleCategory && booking.vehicleCategory !== driver.vehicleCategory)
    throw new ValidationError(`Booking requires a ${booking.vehicleCategory}, but driver is a ${driver.vehicleCategory}.`);

  const rejectedIds = (booking.rejectedBy || []).map((id) => id.toString());
  if (rejectedIds.includes(driverId.toString()))
    throw new ValidationError("This driver has already rejected this booking.");

  if (driver.driverStatus !== "available")
    throw new ValidationError("Driver is not available.");

  await _setDriverBusy(driverId, "busy");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.DriverAssigned,
    driverId,
    assignedBy: userId,
    assignedAt: new Date(),
    rejectionReason: null,
  });

  console.log(`[Assign] Assigned driver ${driverId} to booking ${bookingId}`);
  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-assigned", populated);
  return populated;
};

const unassignDriver = async (bookingId, userId, userCity, userRole) => {
  console.log(`[Assign] ${userRole} ${userId} unassigning booking ${bookingId}`);
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Only driver_assigned bookings can be unassigned.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only unassign bookings in your city.");

  const driverIdToFree = booking.driverId?._id ?? booking.driverId;
  if (driverIdToFree) await _setDriverBusy(driverIdToFree, "available");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Pending,
    driverId: null,
    assignedBy: null,
    assignedAt: null,
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-unassigned", populated);
  return populated;
};

const acceptBooking = async (bookingId, driverId) => {
  console.log(`[Assign] Driver ${driverId} accepting booking ${bookingId}`);
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Booking is not in assignable state.");
  if (String(booking.driverId?._id ?? booking.driverId) !== driverId)
    throw new ValidationError("You are not the assigned driver.");

  await _setDriverBusy(driverId, "busy");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.DriverAccepted,
    acceptedAt: new Date(),
  });

  console.log(`[Assign] Driver ${driverId} accepted booking ${bookingId}`);
  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-accepted", populated);
  return populated;
};

const rejectBooking = async (bookingId, driverId, reason) => {
  console.log(`[Assign] Driver ${driverId} rejecting booking ${bookingId}, reason: "${reason || "none"}"`);
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  const rejectableStates = [BookingStatus.DriverAssigned, BookingStatus.DriverAccepted];
  if (!rejectableStates.includes(booking.status))
    throw new ValidationError("Booking cannot be rejected in its current status.");
  if (String(booking.driverId?._id ?? booking.driverId) !== driverId)
    throw new ValidationError("You are not the assigned driver.");

  await _setDriverBusy(driverId, "available");

  const updated = await bookingRepo.updateBooking(bookingId, {
    $set: {
      status: BookingStatus.DriverRejected,
      rejectionReason: reason || "",
      rejectedAt: new Date(),
    },
    $addToSet: { rejectedBy: driverId },
  });

  console.log(`[Assign] Driver ${driverId} added to rejectedBy for booking ${bookingId}`);
  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-rejected", populated);
  return populated;
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
  if (String(booking.driverId?._id ?? booking.driverId) !== driverId)
    throw new ValidationError("You are not the assigned driver.");

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: targetStatus,
    [transition.tsField]: new Date(),
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent(transition.event, populated);
  return populated;
};

const timeoutAssignment = async (bookingId) => {
  console.log(`[Assign] Timeout check — processing booking ${bookingId}`);
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.DriverAssigned)
    throw new ValidationError("Booking is not in assigned state.");

  const driverIdToFree = booking.driverId?._id ?? booking.driverId;
  if (driverIdToFree) await _setDriverBusy(driverIdToFree, "available");

  const updated = await bookingRepo.updateBooking(bookingId, {
    $set: {
      status: BookingStatus.AssignmentTimeout,
      timedOutAt: new Date(),
    },
    $addToSet: { rejectedBy: driverIdToFree },
  });

  console.log(`[Assign] Booking ${bookingId} timed out — driver ${driverIdToFree} added to rejectedBy`);
  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-timeout", populated);
  return populated;
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
    const dId = booking.driverId?._id ?? booking.driverId;
    if (dId) await _setDriverBusy(dId, "available");
  }

  const updated = await bookingRepo.updateBooking(bookingId, {
    $set: {
      status: BookingStatus.Cancelled,
      cancelledAt: new Date(),
      cancellationReason: reason || "",
    },
  });

  const populated = await bookingRepo.findById(bookingId);
  notificationService.emitBookingEvent("booking-cancelled", populated);
  return populated;
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
