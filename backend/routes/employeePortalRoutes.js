const express = require("express");
const router = express.Router();
const employeePortalController = require("../controllers/employeePortalController");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer for Profile Photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profiles/"),
  filename: (req, file, cb) => cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// All routes here require employee token
router.use(verifyToken);

router.get("/dashboard", employeePortalController.getDashboardStats);
router.get("/attendance", employeePortalController.getAttendanceHistory);
router.get("/salary", employeePortalController.getSalaryHistory);
router.get("/leaves", employeePortalController.getLeaveStatus);
router.post("/leaves", employeePortalController.applyLeave);
router.get("/profile", employeePortalController.getProfile);
router.put("/profile", employeePortalController.updateProfile);
router.post("/profile/upload-photo", upload.single("photo"), employeePortalController.uploadPhoto);
router.get("/notifications", employeePortalController.getNotifications);
router.put("/notifications/:id/read", employeePortalController.markNotificationRead);
router.put("/change-password", employeePortalController.changePassword);

module.exports = router;
