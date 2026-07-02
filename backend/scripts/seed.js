const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../src/config");

const drivers = [
  { name: "Amandeep Singh", phone: "9876543210", city: "Chandigarh", vehicleNumber: "CH-01-AB-1234", vehicleModel: "Activa 6G", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available", location: { lat: 30.7415, lng: 76.7853 } },
  { name: "Gurpreet Kaur", phone: "9876543211", city: "Chandigarh", vehicleNumber: "CH-01-CD-5678", vehicleModel: "Swift Dzire", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "available", location: { lat: 30.7072, lng: 76.7648 } },
  { name: "Rohit Sharma", phone: "9876543212", city: "Chandigarh", vehicleNumber: "CH-01-EF-9012", vehicleModel: "Royal Enfield", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available", location: { lat: 30.7287, lng: 76.7708 } },
  { name: "Simran Jeet", phone: "9876543213", city: "Chandigarh", vehicleNumber: "CH-01-GH-3456", vehicleModel: "Innova Crysta", seatingCapacity: 7, vehicleCategory: "car", driverStatus: "available", location: { lat: 30.7506, lng: 76.7774 } },
  { name: "Vikram Srivastava", phone: "9876543214", city: "Chandigarh", vehicleNumber: "CH-01-IJ-7890", vehicleModel: "Honda City", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "busy", location: { lat: 30.7195, lng: 76.8008 } },
  { name: "Jaspreet Singh", phone: "9876543215", city: "Chandigarh", vehicleNumber: "CH-01-KL-2345", vehicleModel: "Pulsar 150", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available", location: { lat: 30.6929, lng: 76.7603 } },
  { name: "Neha Gupta", phone: "9876543216", city: "Chandigarh", vehicleNumber: "CH-01-MN-6789", vehicleModel: "Hyundai i20", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "available", location: { lat: 30.7449, lng: 76.7715 } },
  { name: "Mandeep Singh", phone: "9876543217", city: "Chandigarh", vehicleNumber: "CH-01-OP-0123", vehicleModel: "Splendor Plus", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "offline", location: { lat: 30.7324, lng: 76.7750 } },
  { name: "Ravneet Kaur", phone: "9876543218", city: "Chandigarh", vehicleNumber: "CH-01-QR-4567", vehicleModel: "Toyota Camry", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "available", location: { lat: 30.7047, lng: 76.7213 } },
  { name: "Arjun Mehta", phone: "9876543219", city: "Chandigarh", vehicleNumber: "CH-01-ST-8901", vehicleModel: "Access 125", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available", location: { lat: 30.7385, lng: 76.7820 } },
];

async function seed() {
  await mongoose.connect(config.mongoURI);
  const User = require("../src/models/User");

  await User.deleteMany({ role: "driver" });
  console.log("Cleared existing drivers.");

  const passwordHash = await bcrypt.hash("driver123", 10);

  const docs = drivers.map((d) => ({
    name: d.name,
    email: `${d.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    passwordHash,
    phone: d.phone,
    role: "driver",
    city: d.city,
    vehicleNumber: d.vehicleNumber,
    vehicleModel: d.vehicleModel,
    seatingCapacity: d.seatingCapacity,
    vehicleCategory: d.vehicleCategory,
    driverStatus: d.driverStatus,
  }));

  const created = await User.insertMany(docs);
  console.log(`Seeded ${created.length} drivers for ${drivers[0].city}.`);
  console.log("\nLogin credentials for all drivers:");
  console.log("  Password: driver123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
