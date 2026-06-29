const mongoose = require("mongoose");
const { BookingStatus } = require("../utils/constants");

const historyEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    remarks: { type: String },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropLocation: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    bookingTime: {
      type: Date,
      required: true,
    },
    pickupTime: {
      type: Date,
    },
    estimatedDropTime: {
      type: Date,
    },
    actualDropTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.Pending,
    },
    driverRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledReason: {
      type: String,
    },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
