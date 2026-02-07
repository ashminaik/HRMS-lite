require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "HRMS Lite API running" });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate key error." });
  }
  return res.status(500).json({ message: "Server error." });
});

connectDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
