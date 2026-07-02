const router = require("express").Router();
const User = require("../models/User");
const { authenticate, checkPermission } = require("../middlewares/auth");
const { sendSuccess } = require("../utils/response");

router.get("/", authenticate, checkPermission, async (req, res, next) => {
  try {
    const { city, availableOnly, driverStatus } = req.query;
    const filter = { role: "driver" };

    if (req.user.role === "manager") {
      filter.city = req.user.city;
    } else if (city) {
      filter.city = city;
    }

    if (driverStatus) {
      filter.driverStatus = driverStatus;
    }

    const selectFields = "name email phone city vehicleNumber vehicleModel seatingCapacity vehicleCategory driverStatus";
    let drivers = await User.find(filter).select(selectFields);

    if (availableOnly === "true") {
      drivers = drivers.filter((d) => d.driverStatus === "available");
    }

    sendSuccess(res, drivers, "Drivers fetched.");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
