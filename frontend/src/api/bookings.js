import api from "./axios";

export const getBookings = (params) => api.get("/bookings", { params });
export const getCities = () => api.get("/bookings/cities");
export const assignBooking = (id, driverId) =>
  api.patch(`/bookings/${id}/assign`, { driverId });
export const unassignBooking = (id) => api.patch(`/bookings/${id}/unassign`);
export const completeBooking = (id) => api.patch(`/bookings/${id}/complete`);
export const cancelBooking = (id, reason) =>
  api.patch(`/bookings/${id}/cancel`, { reason });
