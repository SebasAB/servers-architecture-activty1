const express = require("express");
const router = express.Router();
const employeesController = require("../controllers/employees.controller");

// GET /api/employees/oldest
router.get("/oldest", employeesController.getOldestEmployee);

// GET /api/employees/:name
router.get("/:name", employeesController.getEmployeeByName);

// GET /api/employees
router.get("/", employeesController.getEmployees);

// POST /api/employees
router.post("/", employeesController.createEmployee);

module.exports = router;
