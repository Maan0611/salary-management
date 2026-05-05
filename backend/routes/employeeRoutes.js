const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes are protected with verifyToken
router.use(verifyToken);

router.get("/", employeeController.getAllEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.addEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;