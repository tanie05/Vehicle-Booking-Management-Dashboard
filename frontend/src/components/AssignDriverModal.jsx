import { useState, useEffect } from "react";
import { getNearbyDrivers } from "../api/bookings";
import styles from "./AssignDriverModal.module.css";

const PICKUP_COLOR = "#ef4444";
const BEST_COLOR = "#22c55e";
const DRIVER_COLOR = "#3b82f6";

const MapPin = ({ cx, cy, driver, index }) => {
  const isPickup = !driver;
  const color = isPickup ? PICKUP_COLOR : index === 0 ? BEST_COLOR : DRIVER_COLOR;
  const label = isPickup ? "Pickup" : `${index + 1}. ${driver.name}`;

  const tip = isPickup
    ? "Pickup location — select a driver to assign"
    : `${driver.name} | ${driver.vehicleModel} (${driver.vehicleCategory}) ${driver.vehicleNumber} | ETA: ${driver.eta || driver.straightDistance.toFixed(1) + " km"}`;

  return (
    <g className={isPickup ? styles.pinPickup : styles.pinDriver}>
      <title>{tip}</title>
      {!isPickup && (
        <circle cx={cx} cy={cy} r={14} fill="none" stroke={color} strokeWidth={1} className={styles.pinRing} />
      )}
      <circle cx={cx} cy={cy} r={isPickup ? 10 : 8} fill={color} stroke="#fff" strokeWidth={3}
        className={styles.pinCircle} />
      <text x={cx + 14} y={cy + 4} fontSize={11} fill="#1e293b" fontWeight={isPickup ? 700 : 500}
        className={styles.pinLabel}>{label}</text>
    </g>
  );
};

const SimpleMap = ({ pickupLat, pickupLng, drivers }) => {
  const allLats = [pickupLat, ...drivers.map((d) => d.location?.lat || 0)];
  const allLngs = [pickupLng, ...drivers.map((d) => d.location?.lng || 0)];
  const minLat = Math.min(...allLats) - 0.015;
  const maxLat = Math.max(...allLats) + 0.015;
  const minLng = Math.min(...allLngs) - 0.015;
  const maxLng = Math.max(...allLngs) + 0.015;
  const w = 400, h = 220;
  const pad = 40;

  const toX = (lng) => pad + ((lng - minLng) / (maxLng - minLng)) * (w - 2 * pad);
  const toY = (lat) => h - pad - ((lat - minLat) / (maxLat - minLat)) * (h - 2 * pad);

  if (drivers.length === 0) return null;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const x = pad + (i / 4) * (w - 2 * pad);
    const y = pad + (i / 4) * (h - 2 * pad);
    gridLines.push(
      <line key={`v${i}`} x1={x} y1={pad} x2={x} y2={h - pad} stroke="#dbeafe" strokeWidth={0.5} />,
      <line key={`h${i}`} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#dbeafe" strokeWidth={0.5} />
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={styles.mapSvg}>
      <rect width={w} height={h} fill="#f0f9ff" rx={8} />
      {gridLines}
      <rect width={w} height={h} fill="none" stroke="#bfdbfe" strokeWidth={1} rx={8} />

      <MapPin cx={toX(pickupLng)} cy={toY(pickupLat)} />
      {drivers.map((d, i) => (
        <MapPin key={d._id} cx={toX(d.location.lng)} cy={toY(d.location.lat)}
          driver={d} index={i} />
      ))}
    </svg>
  );
};

export default function AssignDriverModal({ booking, onAssign, onClose }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pickupLat = 30.7415;
  const pickupLng = 76.7853;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getNearbyDrivers(booking._id, pickupLat, pickupLng);
        setDrivers(res.data.data.drivers);
      } catch (err) {
        setError("Failed to load nearby drivers.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [booking._id, pickupLat, pickupLng]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.heading}>Assign Driver</h3>
        <p className={styles.info}>
          {booking.customerName} &mdash; {booking.pickupAddress}, {booking.city}
        </p>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Finding nearby drivers...</p>
        ) : drivers.length === 0 ? (
          <p className={styles.error}>No available drivers found nearby.</p>
        ) : (
          <>
            <SimpleMap pickupLat={pickupLat} pickupLng={pickupLng} drivers={drivers} pickupAddress={booking.pickupAddress} />

            <p className={styles.sortLabel}>Sorted by ETA (lowest first)</p>

            <div className={styles.driverList}>
              {drivers.map((d, i) => (
                <div key={d._id} className={styles.driverCard}>
                  <div className={styles.rank}>{i + 1}</div>
                  <div className={styles.driverInfo}>
                    <strong>{d.name}</strong>
                    <div className={styles.vehicleInfo}>
                      {d.vehicleModel} ({d.vehicleCategory}) &mdash; {d.vehicleNumber}
                    </div>
                    <div className={styles.etaInfo}>
                      {d.eta ? (
                        <span className={styles.eta}>ETA: {d.eta}</span>
                      ) : (
                        <span className={styles.eta}>{d.straightDistance.toFixed(1)} km away</span>
                      )}
                      {d.drivingDistance && (
                        <span className={styles.dist}>{d.drivingDistance}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.assignBtn}
                    onClick={() => onAssign(booking._id, d._id)}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
