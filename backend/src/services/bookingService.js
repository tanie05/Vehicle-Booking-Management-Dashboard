const bookingRepo = require("../repositories/bookingRepository");
const userRepo = require("../repositories/userRepository");
const { BookingStatus, DriverStatus } = require("../utils/constants");
const { NotFoundError, ValidationError, ConflictError } = require("../utils/errors");
const { emitBookingEvent } = require("../socket");

const createBooking = async (data, customerId) => {
  const booking = await bookingRepo.create({
    ...data,
    customerRef: customerId,
    status: BookingStatus.Pending,
    history: [
      {
        action: "Booking created",
        performedBy: customerId,
        timestamp: new Date(),
      },
    ],
  });
  const populated = await bookingRepo.findById(booking._id);
  emitBookingEvent("booking-created", populated);
  return booking;
};

const assignBooking = async (bookingId, driverId, userId, userCity, userRole) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.Pending)
    throw new ValidationError("Only pending bookings can be assigned.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only assign bookings in your city.");

  const driver = await userRepo.findById(driverId);
  if (!driver || driver.role !== "driver")
    throw new NotFoundError("Driver not found.");
  if (driver.driverStatus !== DriverStatus.Available)
    throw new ValidationError("Driver is not available.");
  if (userRole === "manager" && driver.city !== userCity)
    throw new ValidationError("You can only assign drivers from your city.");

  if (booking.city !== driver.city)
    throw new ValidationError("Driver must be in the same city as the booking.");

  await userRepo.updateDriverStatus(driverId, DriverStatus.Busy);

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Assigned,
    driverRef: driverId,
    assignedBy: userId,
    $push: {
      history: {
        action: "Booking assigned",
        performedBy: userId,
        timestamp: new Date(),
        remarks: `Assigned to ${driver.name}`,
      },
    },
  });

  const populated = await bookingRepo.findById(bookingId);
  emitBookingEvent("booking-assigned", populated);
  return updated;
};

const unassignBooking = async (bookingId, userId, userCity, userRole) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.Assigned)
    throw new ValidationError("Only assigned bookings can be unassigned.");

  if (userRole === "manager" && booking.city !== userCity)
    throw new ValidationError("You can only unassign bookings in your city.");

  if (booking.driverRef) {
    await userRepo.updateDriverStatus(booking.driverRef, DriverStatus.Available);
  }

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Pending,
    driverRef: null,
    assignedBy: null,
    $push: {
      history: {
        action: "Booking unassigned",
        performedBy: userId,
        timestamp: new Date(),
      },
    },
  });

  const populated = await bookingRepo.findById(bookingId);
  emitBookingEvent("booking-unassigned", populated);
  return updated;
};

const completeBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status !== BookingStatus.Assigned)
    throw new ValidationError("Only assigned bookings can be completed.");

  if (booking.driverRef) {
    await userRepo.updateDriverStatus(booking.driverRef, DriverStatus.Available);
  }

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Completed,
    actualDropTime: new Date(),
    $push: {
      history: {
        action: "Booking completed",
        performedBy: userId,
        timestamp: new Date(),
      },
    },
  });

  const populated = await bookingRepo.findById(bookingId);
  emitBookingEvent("booking-completed", populated);
  return updated;
};

const cancelBooking = async (bookingId, userId, userRole, reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found.");
  if (booking.status === BookingStatus.Completed)
    throw new ValidationError("Completed bookings cannot be cancelled.");
  if (booking.status === BookingStatus.Cancelled)
    throw new ValidationError("Booking is already cancelled.");

  if (userRole === "customer" && booking.customerRef?.toString() !== userId)
    throw new ValidationError("You can only cancel your own bookings.");
  if (userRole === "driver" && booking.driverRef?.toString() !== userId)
    throw new ValidationError("You can only cancel bookings assigned to you.");

  if (booking.driverRef) {
    await userRepo.updateDriverStatus(booking.driverRef, DriverStatus.Available);
  }

  const updated = await bookingRepo.updateBooking(bookingId, {
    status: BookingStatus.Cancelled,
    cancelledBy: userId,
    cancelledReason: reason || "",
    $push: {
      history: {
        action: "Booking cancelled",
        performedBy: userId,
        timestamp: new Date(),
        remarks: reason,
      },
    },
  });

  const populated = await bookingRepo.findById(bookingId);
  emitBookingEvent("booking-cancelled", populated);
  return updated;
};

const getBookings = async (filters, user) => {
  const query = { ...filters };

  if (user.role === "manager") {
    query.city = user.city;
  } else if (user.role === "driver") {
    query.driverRef = user.id;
  } else if (user.role === "customer") {
    query.customerRef = user.id;
  }

  return bookingRepo.findBookings(query);
};

module.exports = { createBooking, assignBooking, unassignBooking, completeBooking, cancelBooking, getBookings };
