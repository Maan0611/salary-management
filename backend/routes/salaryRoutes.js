const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", salaryController.getAllSalary);
router.post("/generate", salaryController.generateSalary);
router.put("/approve/:id", salaryController.approveSalary);
router.put("/reject/:id", salaryController.rejectSalary);
router.post("/bulk-approve", salaryController.bulkApprove);
router.put("/pay/:id", salaryController.paySalary);
router.put("/update/:id", salaryController.updateSalary);
router.delete("/:id", salaryController.deleteSalary);

module.exports = router;
