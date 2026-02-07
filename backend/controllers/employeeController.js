const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, fullName, email, department, role } = req.body;

    if (!employeeId || !fullName || !email || !department || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Employee.findOne({
      $or: [{ employeeId }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Employee ID or email already exists." });
    }

    const employee = await Employee.create({
      employeeId,
      fullName,
      email,
      department,
      role,
    });

    return res.status(201).json(employee);
  } catch (err) {
    return next(err);
  }
};

const listEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json(employees);
  } catch (err) {
    return next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    await Attendance.deleteMany({ employee: employee._id });

    return res.json({ message: "Employee deleted." });
  } catch (err) {
    return next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId, fullName, email, department, role } = req.body;

    if (!employeeId || !fullName || !email || !department || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const duplicate = await Employee.findOne({
      _id: { $ne: id },
      $or: [{ employeeId }, { email: email.toLowerCase() }],
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "Employee ID or email already exists." });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { employeeId, fullName, email, department, role },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    return res.json(employee);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createEmployee,
  listEmployees,
  deleteEmployee,
  updateEmployee,
};
