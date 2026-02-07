const express = require("express");
const {
  markAttendance,
  getAttendanceByEmployee,
  listAttendanceByDate,
  getAttendanceSummary,
  getStatistics,
} = require("../controllers/attendanceController");

const router = express.Router();

router.get("/statistics", getStatistics);
router.get("/summary", getAttendanceSummary);
router.get("/", listAttendanceByDate);
router.post("/", markAttendance);
router.get("/:employeeId", getAttendanceByEmployee);

module.exports = router;
