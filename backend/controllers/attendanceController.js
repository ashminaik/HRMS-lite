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
    const { date } = req.query;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const query = { employee: employee._id };
    if (date) {
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

module.exports = {
  markAttendance,
  getAttendanceByEmployee,
  listAttendanceByDate,
  getAttendanceSummary,
};
