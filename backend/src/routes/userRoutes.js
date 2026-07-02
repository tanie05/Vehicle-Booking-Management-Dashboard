const router = require("express").Router();
const userController = require("../controllers/userController");
const { authenticate, checkPermission } = require("../middlewares/auth");

router.post("/", authenticate, checkPermission, userController.create);
router.patch("/:id/role", authenticate, checkPermission, userController.updateRole);

module.exports = router;
