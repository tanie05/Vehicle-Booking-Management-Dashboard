const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../src/config");

const drivers = [
  // Sector 17 — 3 drivers
  { name: "Amandeep Singh", phone: "9876543210", city: "Chandigarh", vehicleNumber: "CH-01-AB-1234", vehicleModel: "Activa 6G", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available" },
  { name: "Neha Gupta",     phone: "9876543216", city: "Chandigarh", vehicleNumber: "CH-01-MN-6789", vehicleModel: "Hyundai i20", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "available" },
  { name: "Arjun Mehta",    phone: "9876543219", city: "Chandigarh", vehicleNumber: "CH-01-ST-8901", vehicleModel: "Access 125", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available" },
  // Sector 14 — 2 drivers
  { name: "Simran Jeet",   phone: "9876543213", city: "Chandigarh", vehicleNumber: "CH-01-GH-3456", vehicleModel: "Innova Crysta", seatingCapacity: 7, vehicleCategory: "car", driverStatus: "available" },
  { name: "Ravneet Kaur",  phone: "9876543218", city: "Chandigarh", vehicleNumber: "CH-01-QR-4567", vehicleModel: "Toyota Camry", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "available" },
  // Sector 25 — 3 drivers
  { name: "Gurpreet Kaur", phone: "9876543211", city: "Chandigarh", vehicleNumber: "CH-01-CD-5678", vehicleModel: "Swift Dzire", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "available" },
  { name: "Jaspreet Singh",phone: "9876543215", city: "Chandigarh", vehicleNumber: "CH-01-KL-2345", vehicleModel: "Pulsar 150", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available" },
  { name: "Mandeep Singh", phone: "9876543217", city: "Chandigarh", vehicleNumber: "CH-01-OP-0123", vehicleModel: "Splendor Plus", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "offline" },
  // Sector 22 — 2 drivers
  { name: "Rohit Sharma",  phone: "9876543212", city: "Chandigarh", vehicleNumber: "CH-01-EF-9012", vehicleModel: "Royal Enfield", seatingCapacity: 2, vehicleCategory: "bike", driverStatus: "available" },
  { name: "Vikram Srivastava", phone: "9876543214", city: "Chandigarh", vehicleNumber: "CH-01-IJ-7890", vehicleModel: "Honda City", seatingCapacity: 4, vehicleCategory: "car", driverStatus: "busy" },
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
