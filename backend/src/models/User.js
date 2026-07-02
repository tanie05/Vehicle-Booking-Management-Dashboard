const mongoose = require("mongoose");
const { Role, DriverStatus, VehicleCategory } = require("../utils/constants");

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
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    vehicleModel: {
      type: String,
      trim: true,
    },
    seatingCapacity: {
      type: Number,
    },
    vehicleCategory: {
      type: String,
      enum: Object.values(VehicleCategory),
    },
    driverStatus: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.Offline,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ city: 1, driverStatus: 1 });

module.exports = mongoose.model("User", userSchema);
