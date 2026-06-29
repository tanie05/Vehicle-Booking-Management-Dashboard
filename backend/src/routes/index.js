const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/bookings", require("./bookingRoutes"));
router.use("/vehicles", require("./vehicleRoutes"));
router.use("/drivers", require("./driverRoutes"));

module.exports = router;
