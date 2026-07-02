const router = require("express").Router();
const User = require("../models/User");
const scheduleRepo = require("../repositories/scheduleRepository");
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
      const now = new Date();
      const noSchedule = [];
      for (const driver of drivers) {
        const overlap = await scheduleRepo.findOverlapping(driver._id, now, now);
        if (!overlap) noSchedule.push(driver);
      }
      drivers = noSchedule;
    }

    sendSuccess(res, drivers, "Drivers fetched.");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
