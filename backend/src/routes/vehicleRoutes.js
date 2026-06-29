const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const { authenticate, checkPermission } = require("../middlewares/auth");
const { sendSuccess, sendError } = require("../utils/response");

router.post("/", authenticate, checkPermission, async (req, res, next) => {
  try {
    const { registrationNumber, vehicleModel, type } = req.body;
    if (!registrationNumber || !vehicleModel || !type) {
      return sendError(res, "registrationNumber, vehicleModel, and type are required.", 400);
    }
    const vehicle = await Vehicle.create(req.body);
    sendSuccess(res, vehicle, "Vehicle created.", 201);
  } catch (err) {
    next(err);
  }
});

router.get("/", authenticate, checkPermission, async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate("assignedDriver", "name email");
    sendSuccess(res, vehicles, "Vehicles fetched.");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
