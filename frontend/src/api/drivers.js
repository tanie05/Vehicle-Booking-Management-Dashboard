import api from "./axios";

export const getDrivers = (params) => api.get("/drivers", { params });
