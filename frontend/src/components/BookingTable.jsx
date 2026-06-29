import { useState } from "react";
import { assignBooking, unassignBooking, completeBooking, cancelBooking } from "../api/bookings";
import AssignDriverModal from "./AssignDriverModal";

const statusBadge = (status) => {
  const colors = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    assigned: { bg: "#dbeafe", color: "#1e40af" },
    completed: { bg: "#dcfce7", color: "#166534" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    due: { bg: "#fecaca", color: "#7f1d1d" },
  };
  const c = colors[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        background: c.bg,
        color: c.color,
      }}
    >
      {status}
    </span>
  );
};

const cellStyle = { padding: "8px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 14 };

const thStyle = {
  ...cellStyle,
  textAlign: "left",
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#64748b",
  background: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
};

export default function BookingTable({ bookings, onRefresh, user }) {
  const [assignFor, setAssignFor] = useState(null);

  const handleAssign = async (id, driverId) => {
    await assignBooking(id, driverId);
    setAssignFor(null);
    onRefresh();
  };

  const handleUnassign = async (id) => {
    if (!window.confirm("Unassign driver from this booking?")) return;
    await unassignBooking(id);
    onRefresh();
  };

  const handleComplete = async (id) => {
    await completeBooking(id);
    onRefresh();
  };

  const handleCancel = async (id) => {
    const reason = prompt("Reason for cancellation:");
    if (reason === null) return;
    await cancelBooking(id, reason);
    onRefresh();
  };

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Pickup</th>
              <th style={thStyle}>Drop</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Driver</th>
              <th style={thStyle}>Journey</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b._id}
                style={{
                  background: b.status === "due" ? "#fef2f2" : "transparent",
                }}
              >
                <td style={cellStyle}>{b.customerName}</td>
                <td style={cellStyle}>{b.customerPhone}</td>
                <td style={cellStyle}>{b.pickupAddress}</td>
                <td style={cellStyle}>{b.dropAddress}</td>
                <td style={cellStyle}>{b.city}</td>
                <td style={cellStyle}>{statusBadge(b.status)}</td>
                <td style={cellStyle}>{b.driverId?.name || "-"}</td>
                <td style={{ ...cellStyle, fontSize: 12 }}>
                  {new Date(b.journeyStart).toLocaleString()}
                </td>
                <td style={cellStyle}>
                  <RowActions
                    booking={b}
                    user={user}
                    onAssign={() => setAssignFor(b)}
                    onUnassign={() => handleUnassign(b._id)}
                    onComplete={() => handleComplete(b._id)}
                    onCancel={() => handleCancel(b._id)}
                  />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...cellStyle, textAlign: "center", color: "#94a3b8" }}>
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {assignFor && (
        <AssignDriverModal
          booking={assignFor}
          user={user}
          onAssign={handleAssign}
          onClose={() => setAssignFor(null)}
        />
      )}
    </>
  );
}

function RowActions({ booking, user, onAssign, onUnassign, onComplete, onCancel }) {
  const canAssign =
    booking.status === "pending" && ["admin", "manager"].includes(user?.role);
  const canUnassign =
    booking.status === "assigned" && ["admin", "manager"].includes(user?.role);
  const canComplete =
    booking.status === "assigned" && ["admin", "manager", "driver"].includes(user?.role);
  const canCancel =
    ["pending", "assigned", "due"].includes(booking.status) &&
    ["admin", "manager", "driver", "customer"].includes(user?.role);

  const btnStyle = {
    padding: "4px 10px",
    borderRadius: 4,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
    marginRight: 4,
  };

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {canAssign && (
        <button style={btnStyle} onClick={onAssign}>
          Assign
        </button>
      )}
      {canUnassign && (
        <button style={{ ...btnStyle, borderColor: "#f59e0b", color: "#92400e" }} onClick={onUnassign}>
          Unassign
        </button>
      )}
      {canComplete && (
        <button style={{ ...btnStyle, borderColor: "#22c55e", color: "#166534" }} onClick={onComplete}>
          Complete
        </button>
      )}
      {canCancel && (
        <button style={{ ...btnStyle, borderColor: "#ef4444", color: "#991b1b" }} onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  );
}
