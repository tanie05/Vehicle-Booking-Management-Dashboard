const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/bookings", require("./bookingRoutes"));
router.use("/drivers", require("./driverRoutes"));

module.exports = router;
