require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("./models/Employee");
const { employees } = require("./dummyData");

const seedEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB || "hrms_lite",
    });

    await Employee.deleteMany();
    await Employee.insertMany(employees);

    console.log("Dummy employees inserted");
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedEmployees();
