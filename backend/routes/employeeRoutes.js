const express = require("express");
const {
  createEmployee,
  listEmployees,
  deleteEmployee,
  updateEmployee,
} = require("../controllers/employeeController");

const router = express.Router();

router.get("/", listEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
