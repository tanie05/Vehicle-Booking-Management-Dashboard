const router = require("express").Router();
const User = require("../models/User");
const scheduleRepo = require("../repositories/scheduleRepository");
const { authenticate, checkPermission } = require("../middlewares/auth");
const { sendSuccess } = require("../utils/response");

router.get("/", authenticate, checkPermission, async (req, res, next) => {
  try {
    const { city, availableOnly } = req.query;
    const filter = { role: "driver" };

    if (req.user.role === "manager") {
      filter.city = req.user.city;
    } else if (city) {
      filter.city = city;
    }

    let drivers = await User.find(filter).select("name email phone city vehicleNumber");

    if (availableOnly === "true") {
      const now = new Date();
      const available = [];
      for (const driver of drivers) {
        const overlap = await scheduleRepo.findOverlapping(driver._id, now, now);
        if (!overlap) {
          available.push(driver);
        }
      }
      drivers = available;
    }

    sendSuccess(res, drivers, "Drivers fetched.");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
