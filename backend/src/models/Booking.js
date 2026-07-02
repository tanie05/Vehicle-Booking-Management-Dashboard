const mongoose = require("mongoose");
const { BookingStatus } = require("../utils/constants");
const { VehicleCategory } = require("../utils/constants");
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
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    dropAddress: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    journeyStart: {
      type: Date,
      required: true,
    },
    journeyEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.Pending,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    rejectedAt: { type: Date },
    rejectedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    vehicleCategory: {
      type: String,
      enum: Object.values(VehicleCategory),
    },
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    goingToPickupAt: { type: Date },
    arrivedAt: { type: Date },
    onboardedAt: { type: Date },
    tripStartedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    timedOutAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ city: 1, status: 1, createdAt: -1 });
bookingSchema.index({ driverId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, assignedAt: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
