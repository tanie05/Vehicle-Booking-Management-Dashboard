const router = require("express").Router();
const authController = require("../controllers/authController");
const { authenticate, checkPermission } = require("../middlewares/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/drivers", authenticate, checkPermission, authController.createDriver);
router.post("/managers", authenticate, checkPermission, authController.createManager);

module.exports = router;
