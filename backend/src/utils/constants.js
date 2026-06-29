const Role = Object.freeze({
  Admin: "admin",
  Manager: "manager",
  Driver: "driver",
  Customer: "customer"
});

const BookingStatus = Object.freeze({
  Pending: "pending",
  Assigned: "assigned",
  Completed: "completed",
  Cancelled: "cancelled",
});

module.exports = { Role, BookingStatus };
