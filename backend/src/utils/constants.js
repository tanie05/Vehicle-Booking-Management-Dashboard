const Role = Object.freeze({
  Admin: "admin",
  Manager: "manager",
  Driver: "driver",
  Customer: "customer"
});

const BookingStatus = Object.freeze({
  Pending: "pending",
  DriverAssigned: "driver_assigned",
  DriverAccepted: "driver_accepted",
  GoingToPickup: "going_to_pickup",
  DriverArrived: "driver_arrived",
  CustomerOnboarded: "customer_onboarded",
  TripInProgress: "trip_in_progress",
  Completed: "completed",
  DriverRejected: "driver_rejected",
  AssignmentTimeout: "assignment_timeout",
  Cancelled: "cancelled",
});

const DriverStatus = Object.freeze({
  Available: "available",
  Busy: "busy",
  Offline: "offline",
});

const VehicleCategory = Object.freeze({
  Bike: "bike",
  Car: "car",
});

module.exports = { Role, BookingStatus, DriverStatus, VehicleCategory };
