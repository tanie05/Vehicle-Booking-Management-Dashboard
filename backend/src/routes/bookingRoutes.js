const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, checkPermission } = require("../middlewares/auth");

router.post("/", bookingController.create);
router.get("/", authenticate, checkPermission, bookingController.list);
router.get("/cities", authenticate, checkPermission, bookingController.listCities);

router.patch("/:id/assign", authenticate, checkPermission, bookingController.assign);
router.patch("/:id/unassign", authenticate, checkPermission, bookingController.unassign);
router.patch("/:id/accept", authenticate, checkPermission, bookingController.accept);
router.patch("/:id/reject", authenticate, checkPermission, bookingController.reject);
router.patch("/:id/status", authenticate, checkPermission, bookingController.updateStatus);
router.patch("/:id/complete", authenticate, checkPermission, bookingController.complete);
router.patch("/:id/cancel", authenticate, checkPermission, bookingController.cancel);

module.exports = router;
