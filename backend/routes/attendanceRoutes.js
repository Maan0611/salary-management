const express = require("express");
const router = express.Router();
const { getAttendance, saveAttendance, updateAttendance, checkIn } = require("../controllers/attendanceController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getAttendance);
router.post("/save", verifyToken, saveAttendance);
router.post("/check-in", verifyToken, checkIn);
router.put("/update/:id", verifyToken, updateAttendance);

module.exports = router;
