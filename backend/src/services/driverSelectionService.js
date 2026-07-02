const config = require("../config");
const { haversine } = require("../utils/haversine");
const { getLocation } = require("../data/driverLocations");
const User = require("../models/User");

const MAX_CANDIDATES = 5;

const fetchNearbyDrivers = async (city, pickupLat, pickupLng, excludeDriverIds = []) => {
  console.log(`[DriverSelection] Finding drivers in ${city}, excluding ${excludeDriverIds.length} previously rejected/timeout drivers`);
  const drivers = await User.find({
    role: "driver",
    city,
    driverStatus: "available",
    _id: { $nin: excludeDriverIds },
  }).select("name email phone vehicleNumber vehicleModel seatingCapacity vehicleCategory driverStatus");

  console.log(`[DriverSelection] Found ${drivers.length} available drivers in ${city}`);

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

const _waypoint = (lat, lng) => ({
  waypoint: { location: { latLng: { latitude: lat, longitude: lng } } },
});

const _formatDistance = (meters) => {
  if (!meters && meters !== 0) return null;
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
};

const _formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

const enrichWithGoogleETA = async (drivers, pickupLat, pickupLng) => {
  if (!config.googleApiKey || drivers.length === 0) return drivers;

  const body = {
    origins: drivers.map((d) => _waypoint(d.location.lat, d.location.lng)),
    destinations: [_waypoint(pickupLat, pickupLng)],
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
  };

  try {
    const res = await fetch("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": config.googleApiKey,
        "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,condition",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("Routes API error:", res.status, errText);
      return drivers;
    }

    const entries = await res.json();

    return drivers.map((d, i) => {
      const entry = Array.isArray(entries) ? entries.find((e) => e.originIndex === i) : null;
      const durationSec = entry?.duration ? parseFloat(entry.duration.replace("s", "")) : null;
      return {
        ...d,
        drivingDistance: _formatDistance(entry?.distanceMeters),
        drivingDistanceValue: entry?.distanceMeters ?? null,
        eta: _formatDuration(durationSec),
        etaValue: durationSec,
      };
    });
  } catch (err) {
    console.warn("Routes API call failed:", err.message);
    return drivers;
  }
};

const getPrioritizedDrivers = async (city, pickupLat, pickupLng, excludeDriverIds = []) => {
  if (!pickupLat || !pickupLng) {
    throw new Error("pickupLat and pickupLng are required.");
  }

  let drivers = await fetchNearbyDrivers(city, pickupLat, pickupLng, excludeDriverIds);
  drivers = await enrichWithGoogleETA(drivers, pickupLat, pickupLng);

  if (drivers[0]?.etaValue) {
    drivers.sort((a, b) => a.etaValue - b.etaValue);
  }

  console.log(`[DriverSelection] Returning ${drivers.length} prioritized drivers: ${drivers.map(d => d.name).join(", ")}`);
  return drivers;
};

module.exports = { getPrioritizedDrivers };
