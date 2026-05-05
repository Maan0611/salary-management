const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(verifyToken);
router.get("/profile", adminController.getProfile);
router.put("/profile", adminController.updateProfile);
router.put("/change-password", adminController.changePassword);
router.post("/upload-photo", upload.single('profileImage'), adminController.uploadPhoto);

module.exports = router;
