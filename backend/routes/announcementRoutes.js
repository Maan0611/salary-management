const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads/announcements/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `ann-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Admin Routes
router.post("/create", verifyToken, isAdmin, upload.single("attachment"), announcementController.createAnnouncement);
router.get("/admin/all", verifyToken, isAdmin, announcementController.getAllAnnouncements);
router.put("/:id", verifyToken, isAdmin, upload.single("attachment"), announcementController.updateAnnouncement);
router.delete("/:id", verifyToken, isAdmin, announcementController.deleteAnnouncement);

// Employee Routes
router.get("/employee/all", verifyToken, announcementController.getEmployeeAnnouncements);
router.put("/employee/:id/read", verifyToken, announcementController.markAsRead);

module.exports = router;
