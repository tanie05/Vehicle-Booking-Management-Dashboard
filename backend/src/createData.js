const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("./config");
const User = require("./models/User");
const { Role } = require("./utils/constants");

const cities = ["Delhi", "Gurgaon", "Bengaluru"];

const driverNames = {
  Delhi: [
    { name: "Rohit Sharma", phone: "9000000011", vehicle: "DL-01-AB-1111" },
    { name: "Amit Singh", phone: "9000000012", vehicle: "DL-02-CD-2222" },
    { name: "Vikram Verma", phone: "9000000013", vehicle: "DL-03-EF-3333" },
  ],
  Gurgaon: [
    { name: "Sandeep Yadav", phone: "9000000014", vehicle: "HR-26-AB-4444" },
    { name: "Manish Kumar", phone: "9000000015", vehicle: "HR-26-CD-5555" },
    { name: "Rahul Gupta", phone: "9000000016", vehicle: "HR-55-EF-6666" },
  ],
  Bengaluru: [
    { name: "Suresh Reddy", phone: "9000000017", vehicle: "KA-01-AB-7777" },
    { name: "Mahesh Babu", phone: "9000000018", vehicle: "KA-02-CD-8888" },
    { name: "Venkat Rao", phone: "9000000019", vehicle: "KA-05-EF-9999" },
  ],
};

const run = async () => {
  await mongoose.connect(config.mongoURI);
  console.log("Connected to MongoDB\n");

  const passwordHash = await bcrypt.hash("Test@123", 10);

  // --- Managers ---
  const managerData = cities.map((city, i) => ({
    name: `${city} Manager`,
    email: `manager.${city.toLowerCase()}@example.com`,
    passwordHash,
    phone: `911111110${i + 1}`,
    role: Role.Manager,
    city,
  }));

  const managers = await User.create(managerData);
  console.log("Created managers:");
  managers.forEach((m) => console.log(`  ${m.name} — ${m.email} / Test@123`));

  // --- Drivers ---
  const allDrivers = [];
  for (const city of cities) {
    const drivers = await User.create(
      driverNames[city].map((d) => ({
        name: d.name,
        email: d.name.toLowerCase().replace(/\s+/g, ".") + "@example.com",
        passwordHash,
        phone: d.phone,
        role: Role.Driver,
        city,
        vehicleNumber: d.vehicle,
      }))
    );
    allDrivers.push(...drivers);
    console.log(`\nCreated ${city} drivers:`);
    drivers.forEach((d) =>
      console.log(`  ${d.name} — ${d.vehicleNumber} — ${d.email} / Test@123`)
    );
  }

  console.log("\n=========================================");
  console.log("  BOOKING PAYLOADS (POST /api/bookings)");
  console.log("=========================================\n");
  console.log("Copy-paste these into Postman:\n");

  const now = new Date();
  const future = (hoursFromNow) => {
    const d = new Date(now);
    d.setHours(d.getHours() + hoursFromNow);
    return d.toISOString();
  };

  const bookingPayloads = [
    { customerName: "Priya Sharma", customerPhone: "9812345601", pickupAddress: "Connaught Place", dropAddress: "Dwarka Sector 21", city: "Delhi", journeyStart: future(1), journeyEnd: future(2) },
    { customerName: "Arun Kumar", customerPhone: "9812345602", pickupAddress: "Saket", dropAddress: "Noida Sector 62", city: "Delhi", journeyStart: future(3), journeyEnd: future(4) },
    { customerName: "Neha Gupta", customerPhone: "9812345603", pickupAddress: "Karol Bagh", dropAddress: "Lajpat Nagar", city: "Delhi", journeyStart: future(5), journeyEnd: future(6) },

    { customerName: "Rohit Singh", customerPhone: "9812345604", pickupAddress: "Sector 29", dropAddress: "DLF Cyber City", city: "Gurgaon", journeyStart: future(2), journeyEnd: future(3) },
    { customerName: "Anjali Mehta", customerPhone: "9812345605", pickupAddress: "Sector 56", dropAddress: "Medanta Hospital", city: "Gurgaon", journeyStart: future(4), journeyEnd: future(5) },
    { customerName: "Vivek Agarwal", customerPhone: "9812345606", pickupAddress: "Sector 14", dropAddress: "MG Road", city: "Gurgaon", journeyStart: future(6), journeyEnd: future(7) },

    { customerName: "Lakshmi Iyer", customerPhone: "9812345607", pickupAddress: "HSR Layout", dropAddress: "Electronic City", city: "Bengaluru", journeyStart: future(1), journeyEnd: future(2) },
    { customerName: "Karthik Nair", customerPhone: "9812345608", pickupAddress: "Indiranagar", dropAddress: "Whitefield", city: "Bengaluru", journeyStart: future(3), journeyEnd: future(4) },
    { customerName: "Divya Menon", customerPhone: "9812345609", pickupAddress: "MG Road", dropAddress: "Koramangala", city: "Bengaluru", journeyStart: future(5), journeyEnd: future(6) },
  ];

  bookingPayloads.forEach((b, i) => {
    console.log(`// Booking ${i + 1} — ${b.city}`);
    console.log(JSON.stringify(b, null, 2));
    console.log();
  });

  console.log("Login credentials:");
  console.log("  Admin:     admin@example.com / Test@123");
  managers.forEach((m) => {
    console.log(`  ${m.name}: ${m.email} / Test@123`);
  });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
