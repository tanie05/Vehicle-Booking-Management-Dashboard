const config = require("../config");
const { haversine } = require("../utils/haversine");
const { getLocation } = require("../data/driverLocations");
const User = require("../models/User");

const MAX_CANDIDATES = 5;

const fetchNearbyDrivers = async (city, pickupLat, pickupLng) => {
  const drivers = await User.find({
    role: "driver",
    city,
    driverStatus: "available",
  }).select("name email phone vehicleNumber vehicleModel seatingCapacity vehicleCategory driverStatus");

  const withDistance = drivers
    .map((d) => {
      const loc = getLocation(d.email);
      if (!loc) return null;
      return {
        _id: d._id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        vehicleNumber: d.vehicleNumber,
        vehicleModel: d.vehicleModel,
        seatingCapacity: d.seatingCapacity,
        vehicleCategory: d.vehicleCategory,
        driverStatus: d.driverStatus,
        location: loc,
        straightDistance: haversine(pickupLat, pickupLng, loc.lat, loc.lng),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.straightDistance - b.straightDistance)
    .slice(0, MAX_CANDIDATES);

  return withDistance;
};

const enrichWithGoogleETA = async (drivers, pickupLat, pickupLng) => {
  if (!config.googleApiKey || drivers.length === 0) return drivers;

  const origins = drivers.map((d) => `${d.location.lat},${d.location.lng}`).join("|");
  const dest = `${pickupLat},${pickupLng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${dest}&key=${config.googleApiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.warn("Google Distance Matrix API error:", data.status);
      return drivers;
    }

    return drivers.map((d, i) => {
      const element = data.rows[i]?.elements?.[0];
      return {
        ...d,
        drivingDistance: element?.distance?.text || null,
        drivingDistanceValue: element?.distance?.value || null,
        eta: element?.duration?.text || null,
        etaValue: element?.duration?.value || null,
      };
    });
  } catch (err) {
    console.warn("Google Distance Matrix API call failed:", err.message);
    return drivers;
  }
};

const getPrioritizedDrivers = async (city, pickupLat, pickupLng) => {
  if (!pickupLat || !pickupLng) {
    throw new Error("pickupLat and pickupLng are required.");
  }

  let drivers = await fetchNearbyDrivers(city, pickupLat, pickupLng);
  drivers = await enrichWithGoogleETA(drivers, pickupLat, pickupLng);

  if (drivers[0]?.etaValue) {
    drivers.sort((a, b) => a.etaValue - b.etaValue);
  }

  return drivers;
};

module.exports = { getPrioritizedDrivers };
