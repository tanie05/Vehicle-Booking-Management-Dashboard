import api from "./axios";

export const getBookings = (params) => api.get("/bookings", { params });
export const getCities = () => api.get("/bookings/cities");
export const getNearbyDrivers = (id, pickupLat, pickupLng) =>
  api.get(`/bookings/${id}/nearby-drivers`, { params: { pickupLat, pickupLng } });
export const assignBooking = (id, driverId) =>
  api.patch(`/bookings/${id}/assign`, { driverId });
export const unassignBooking = (id) => api.patch(`/bookings/${id}/unassign`);
export const acceptBooking = (id) => api.patch(`/bookings/${id}/accept`);
export const rejectBooking = (id, reason) =>
  api.patch(`/bookings/${id}/reject`, { reason });
export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status });
export const completeBooking = (id) => api.patch(`/bookings/${id}/complete`);
export const cancelBooking = (id, reason) =>
  api.patch(`/bookings/${id}/cancel`, { reason });
