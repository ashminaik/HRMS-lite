const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

const normalizeDate = (input) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res
        .status(400)
        .json({ message: "employeeId, date, and status are required." });
    }

    if (!["Present", "Absent", "On Leave"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Present, Absent, or On Leave." });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const existing = await Attendance.findOne({
      employee: employee._id,
      date: normalizedDate,
    });

    if (existing) {
      existing.status = status;
      await existing.save();
      return res.status(200).json(existing);
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: normalizedDate,
      status,
    });

    return res.status(201).json(attendance);
  } catch (err) {
    return next(err);
  }
};

const getAttendanceByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { date, start, end } = req.query;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const query = { employee: employee._id };
    
    // Support date range (start and end) or single date
    if (start && end) {
      const startDate = normalizeDate(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      if (!startDate) {
        return res.status(400).json({ message: "Invalid start date." });
      }
      query.date = { $gte: startDate, $lte: endDate };
    } else if (date) {
      const normalized = normalizeDate(date);
      if (!normalized) {
        return res.status(400).json({ message: "Invalid date." });
      }
      const nextDay = new Date(normalized);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: normalized, $lt: nextDay };
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    const totalPresent = records.filter(
      (record) => record.status === "Present"
    ).length;

    return res.json({ employee, records, totalPresent });
  } catch (err) {
    return next(err);
  }
};

const listAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    const normalized = date ? normalizeDate(date) : normalizeDate(new Date());
    if (!normalized) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const nextDay = new Date(normalized);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: normalized, $lt: nextDay },
    })
      .populate("employee")
      .sort({ createdAt: -1 });

    return res.json({ date: normalized, records });
  } catch (err) {
    return next(err);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const normalized = date ? normalizeDate(date) : normalizeDate(new Date());
    if (!normalized) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const nextDay = new Date(normalized);
    nextDay.setDate(nextDay.getDate() + 1);

    const totalEmployees = await Employee.countDocuments();
    const totalRecords = await Attendance.countDocuments({
      date: { $gte: normalized, $lt: nextDay },
    });

    const presentCounts = await Attendance.aggregate([
      { $match: { status: "Present" } },
      { $group: { _id: "$employee", presentDays: { $sum: 1 } } },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeId: "$employee.employeeId",
          fullName: "$employee.fullName",
          department: "$employee.department",
          presentDays: 1,
        },
      },
      { $sort: { presentDays: -1, fullName: 1 } },
    ]);

    const statusCounts = await Attendance.aggregate([
      { $match: { date: { $gte: normalized, $lt: nextDay } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = statusCounts.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      { Present: 0, Absent: 0, "On Leave": 0 }
    );

    return res.json({
      totalEmployees,
      totalRecords,
      presentToday: counts.Present,
      absentToday: counts.Absent,
      onLeaveToday: counts["On Leave"],
      presentCounts,
    });
  } catch (err) {
    return next(err);
  }
};

// Get statistics dashboard data
const getStatistics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total employees
    const totalEmployees = await Employee.countDocuments();

    // Department-wise distribution
    const departmentDistribution = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get all attendance records for this year
    const yearAttendance = await Attendance.find({
      date: { $gte: startOfYear, $lte: today },
    }).populate("employee");

    // Calculate attendance summary for this month
    const monthAttendance = yearAttendance.filter(
      (rec) => new Date(rec.date) >= startOfMonth
    );

    const monthStats = {
      present: monthAttendance.filter((r) => r.status === "Present").length,
      absent: monthAttendance.filter((r) => r.status === "Absent").length,
      onLeave: monthAttendance.filter((r) => r.status === "On Leave").length,
    };
    const monthTotal = monthStats.present + monthStats.absent + monthStats.onLeave;

    // Top absentees and best attendance (year to date)
    const employeeStats = {};
    yearAttendance.forEach((rec) => {
      if (rec.employee) {
        const empId = rec.employee.employeeId;
        if (!employeeStats[empId]) {
          employeeStats[empId] = {
            employeeId: empId,
            fullName: rec.employee.fullName,
            department: rec.employee.department,
            present: 0,
            absent: 0,
            onLeave: 0,
          };
        }
        if (rec.status === "Present") employeeStats[empId].present++;
        else if (rec.status === "Absent") employeeStats[empId].absent++;
        else if (rec.status === "On Leave") employeeStats[empId].onLeave++;
      }
    });

    const statsArray = Object.values(employeeStats);
    const topAbsentees = [...statsArray]
      .sort((a, b) => b.absent - a.absent)
      .slice(0, 3);
    const bestAttendance = [...statsArray]
      .sort((a, b) => b.present - a.present)
      .slice(0, 3);

    // Monthly attendance trends (by month)
    const monthlyTrends = [];
    for (let m = 0; m <= today.getMonth(); m++) {
      const monthStart = new Date(today.getFullYear(), m, 1);
      const monthEnd = new Date(today.getFullYear(), m + 1, 0, 23, 59, 59, 999);
      const monthRecs = yearAttendance.filter((rec) => {
        const d = new Date(rec.date);
        return d >= monthStart && d <= monthEnd;
      });
      monthlyTrends.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        present: monthRecs.filter((r) => r.status === "Present").length,
        absent: monthRecs.filter((r) => r.status === "Absent").length,
        onLeave: monthRecs.filter((r) => r.status === "On Leave").length,
      });
    }

    // Leave analytics by department
    const leaveByDept = {};
    yearAttendance
      .filter((rec) => rec.status === "On Leave" && rec.employee)
      .forEach((rec) => {
        const dept = rec.employee.department;
        leaveByDept[dept] = (leaveByDept[dept] || 0) + 1;
      });
    const totalLeaves = yearAttendance.filter((r) => r.status === "On Leave").length;

    // Today's attendance counts
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayAttendance = yearAttendance.filter((rec) => {
      const d = new Date(rec.date);
      return d >= todayStart && d <= today;
    });
    const todayStats = {
      present: todayAttendance.filter((r) => r.status === "Present").length,
      absent: todayAttendance.filter((r) => r.status === "Absent").length,
      onLeave: todayAttendance.filter((r) => r.status === "On Leave").length,
    };

    // Gender distribution
    const genderCounts = await Employee.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);
    const genderMap = genderCounts.reduce((acc, g) => {
      acc[g._id || "Male"] = g.count;
      return acc;
    }, { Male: 0, Female: 0 });
    const totalGender = genderMap.Male + genderMap.Female;
    const genderDistribution = {
      male: genderMap.Male,
      female: genderMap.Female,
      malePercent: totalGender > 0 ? Math.round((genderMap.Male / totalGender) * 100) : 50,
      femalePercent: totalGender > 0 ? Math.round((genderMap.Female / totalGender) * 100) : 50,
    };

    return res.json({
      totalEmployees,
      departmentDistribution,
      monthStats: {
        ...monthStats,
        total: monthTotal,
        presentPercent: monthTotal > 0 ? Math.round((monthStats.present / monthTotal) * 100) : 0,
        absentPercent: monthTotal > 0 ? Math.round((monthStats.absent / monthTotal) * 100) : 0,
        onLeavePercent: monthTotal > 0 ? Math.round((monthStats.onLeave / monthTotal) * 100) : 0,
      },
      todayStats,
      topAbsentees,
      bestAttendance,
      monthlyTrends,
      genderDistribution,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  markAttendance,
  getAttendanceByEmployee,
  listAttendanceByDate,
  getAttendanceSummary,
  getStatistics,
};
