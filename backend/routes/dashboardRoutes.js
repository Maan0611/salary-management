const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/stats", verifyToken, dashboardController.getStats);
router.get("/departments", verifyToken, dashboardController.getDepartments);
router.get("/system-health", verifyToken, isAdmin, dashboardController.getSystemHealth);

module.exports = router;
