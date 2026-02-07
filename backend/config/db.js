const mongoose = require("mongoose");

const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB || "hrms_lite",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
