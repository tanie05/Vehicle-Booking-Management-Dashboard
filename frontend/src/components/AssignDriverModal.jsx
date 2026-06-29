import { useState, useEffect } from "react";
import { getDrivers } from "../api/drivers";
import styles from "./AssignDriverModal.module.css";

export default function AssignDriverModal({ booking, user, onAssign, onClose }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = {};
      if (booking.city) params.city = booking.city;
      params.availableOnly = "true";
      try {
        const res = await getDrivers(params);
        setDrivers(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [booking.city]);

  const handleAssign = async () => {
    if (!selectedDriver) return;
    setError("");
    try {
      await onAssign(booking._id, selectedDriver);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign driver. Please try again.");
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.heading}>Assign Driver</h3>
        <p className={styles.info}>
          {booking.customerName} &mdash; {booking.city}
          <br />
          {new Date(booking.journeyStart).toLocaleString()} &rarr;{" "}
          {new Date(booking.journeyEnd).toLocaleString()}
        </p>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading drivers...</p>
        ) : drivers.length === 0 ? (
          <p className={styles.error}>No available drivers found.</p>
        ) : (
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className={styles.select}
          >
            <option value="">Select a driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} &mdash; {d.vehicleNumber || "No vehicle"} ({d.city})
              </option>
            ))}
          </select>
        )}

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedDriver}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: selectedDriver ? "#3b82f6" : "#94a3b8",
              color: "#fff",
              cursor: selectedDriver ? "pointer" : "not-allowed",
            }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
