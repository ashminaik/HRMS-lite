require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");

const seedAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB || "hrms_lite",
    });

    // Get all employees
    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees`);

    // Clear existing attendance data for Feb 2-7
    await Attendance.deleteMany({
      date: {
        $gte: new Date("2026-02-02"),
        $lte: new Date("2026-02-07")
      }
    });
    console.log("Cleared existing attendance data for Feb 2-7");

    const attendanceRecords = [];

    // Feb 2nd (Monday): Half employees on leave
    const feb2 = new Date("2026-02-02");
    employees.forEach((emp, index) => {
      let status;
      if (index < employees.length / 2) {
        status = "On Leave";
      } else {
        status = Math.random() > 0.2 ? "Present" : "Absent";
      }
      attendanceRecords.push({
        employee: emp._id,
        date: feb2,
        status
      });
    });

    // Feb 3rd (Tuesday): 1/3 employees absent
    const feb3 = new Date("2026-02-03");
    employees.forEach((emp, index) => {
      let status;
      if (index < employees.length / 3) {
        status = "Absent";
      } else if (index < employees.length / 2) {
        status = "On Leave";
      } else {
        status = "Present";
      }
      attendanceRecords.push({
        employee: emp._id,
        date: feb3,
        status
      });
    });

    // Feb 4th (Wednesday): Mostly present
    const feb4 = new Date("2026-02-04");
    employees.forEach((emp) => {
      const rand = Math.random();
      let status;
      if (rand < 0.75) status = "Present";
      else if (rand < 0.9) status = "On Leave";
      else status = "Absent";
      attendanceRecords.push({
        employee: emp._id,
        date: feb4,
        status
      });
    });

    // Feb 5th (Thursday): Random mix
    const feb5 = new Date("2026-02-05");
    employees.forEach((emp) => {
      const rand = Math.random();
      let status;
      if (rand < 0.6) status = "Present";
      else if (rand < 0.8) status = "On Leave";
      else status = "Absent";
      attendanceRecords.push({
        employee: emp._id,
        date: feb5,
        status
      });
    });

    // Feb 6th (Friday): More leaves (weekend approaching)
    const feb6 = new Date("2026-02-06");
    employees.forEach((emp) => {
      const rand = Math.random();
      let status;
      if (rand < 0.5) status = "Present";
      else if (rand < 0.85) status = "On Leave";
      else status = "Absent";
      attendanceRecords.push({
        employee: emp._id,
        date: feb6,
        status
      });
    });

    // Feb 7th (Saturday - today): Mixed attendance
    const feb7 = new Date("2026-02-07");
    employees.forEach((emp) => {
      const rand = Math.random();
      let status;
      if (rand < 0.65) status = "Present";
      else if (rand < 0.85) status = "On Leave";
      else status = "Absent";
      attendanceRecords.push({
        employee: emp._id,
        date: feb7,
        status
      });
    });

    // Insert all attendance records
    await Attendance.insertMany(attendanceRecords);
    console.log(`Inserted ${attendanceRecords.length} attendance records`);

    // Print summary
    const dates = ["2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05", "2026-02-06", "2026-02-07"];
    for (const dateStr of dates) {
      const dayRecords = attendanceRecords.filter(r => 
        r.date.toISOString().split('T')[0] === dateStr
      );
      const present = dayRecords.filter(r => r.status === "Present").length;
      const absent = dayRecords.filter(r => r.status === "Absent").length;
      const onLeave = dayRecords.filter(r => r.status === "On Leave").length;
      console.log(`${dateStr}: Present=${present}, Absent=${absent}, On Leave=${onLeave}`);
    }

  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAttendance();
