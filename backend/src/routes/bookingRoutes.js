const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, checkPermission } = require("../middlewares/auth");

router.post("/", authenticate, checkPermission, bookingController.create);
router.get("/", authenticate, checkPermission, bookingController.list);
router.patch("/:id/assign", authenticate, checkPermission, bookingController.assign);
router.patch("/:id/unassign", authenticate, checkPermission, bookingController.unassign);
router.patch("/:id/complete", authenticate, checkPermission, bookingController.complete);
router.patch("/:id/cancel", authenticate, checkPermission, bookingController.cancel);

module.exports = router;
