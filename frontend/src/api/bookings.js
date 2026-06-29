import api from "./axios";

export const getBookings = (params) => api.get("/bookings", { params });
export const assignBooking = (id, driverId) =>
  api.patch(`/bookings/${id}/assign`, { driverId });
export const completeBooking = (id) => api.patch(`/bookings/${id}/complete`);
export const cancelBooking = (id, reason) =>
  api.patch(`/bookings/${id}/cancel`, { reason });
