const mongoose = require("mongoose");
const { Role, DriverStatus } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    city: {
      type: String,
      trim: true,
    },
    driverStatus: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.Offline,
    },
    vehicleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
