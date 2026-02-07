require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");

const seedJanFeb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB || "hrms_lite",
    });

    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees`);

    // Clear existing attendance for Jan-Feb 2026
    await Attendance.deleteMany({
      date: {
        $gte: new Date("2026-01-01"),
        $lte: new Date("2026-02-28")
      }
    });
    console.log("Cleared existing attendance for Jan-Feb 2026");

    const attendanceRecords = [];

    // Helper to get random status with average-to-low absences
    const getStatus = () => {
      const rand = Math.random();
      if (rand < 0.80) return "Present";      // 80% present
      if (rand < 0.92) return "On Leave";     // 12% on leave
      return "Absent";                         // 8% absent
    };

    // Generate January 2026 (1-31)
    for (let day = 1; day <= 31; day++) {
      const date = new Date(2026, 0, day); // January is month 0
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      employees.forEach((emp) => {
        attendanceRecords.push({
          employee: emp._id,
          date: date,
          status: getStatus()
        });
      });
    }
    console.log("Generated January 2026 attendance");

    // Generate February 2026 (1-28)
    for (let day = 1; day <= 28; day++) {
      const date = new Date(2026, 1, day); // February is month 1
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      employees.forEach((emp) => {
        attendanceRecords.push({
          employee: emp._id,
          date: date,
          status: getStatus()
        });
      });
    }
    console.log("Generated February 2026 attendance");

    // Insert all records
    await Attendance.insertMany(attendanceRecords);
    console.log(`Inserted ${attendanceRecords.length} attendance records`);

    await mongoose.disconnect();
    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding attendance:", err);
    process.exit(1);
  }
};

seedJanFeb();
