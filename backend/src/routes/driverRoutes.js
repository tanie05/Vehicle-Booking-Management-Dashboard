const router = require("express").Router();
const { authenticate, checkPermission } = require("../middlewares/auth");
const { sendSuccess, sendError } = require("../utils/response");
const User = require("../models/User");

router.get("/", authenticate, checkPermission, async (req, res, next) => {
  try {
    const filter = { role: "driver", isActive: true };
    if (req.user.role === "manager") {
      filter.city = req.user.city;
    }
    const drivers = await User.find(filter).select("name email city driverStatus");
    sendSuccess(res, drivers, "Drivers fetched.");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
