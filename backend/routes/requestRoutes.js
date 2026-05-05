const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Employee Routes
router.post("/create", verifyToken, requestController.createRequest);
router.get("/my", verifyToken, requestController.getMyRequests);

// Admin Routes
router.get("/admin/all", verifyToken, isAdmin, requestController.getAllRequests);
router.put("/admin/:id/approve", verifyToken, isAdmin, requestController.approveRequest);
router.put("/admin/:id/reject", verifyToken, isAdmin, requestController.rejectRequest);
router.get("/admin/pending-count", verifyToken, isAdmin, requestController.getPendingRequestsCount);

module.exports = router;
