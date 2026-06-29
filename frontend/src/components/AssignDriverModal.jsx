import { useState, useEffect } from "react";
import { getDrivers } from "../api/drivers";

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  minWidth: 360,
  maxWidth: 480,
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

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
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px" }}>Assign Driver</h3>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
          Booking: {booking.customerName} &mdash; {booking.city}
          <br />
          {new Date(booking.journeyStart).toLocaleString()} &rarr;{" "}
          {new Date(booking.journeyEnd).toLocaleString()}
        </p>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 12 }}>{error}</p>
        )}

        {loading ? (
          <p>Loading drivers...</p>
        ) : drivers.length === 0 ? (
          <p style={{ color: "#ef4444" }}>No available drivers found.</p>
        ) : (
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 16,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 14,
            }}
          >
            <option value="">Select a driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} &mdash; {d.vehicleNumber || "No vehicle"} ({d.city})
              </option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
            }}
          >
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
