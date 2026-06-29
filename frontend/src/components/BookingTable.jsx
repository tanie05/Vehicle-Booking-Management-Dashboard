import { useState } from "react";
import { assignBooking, unassignBooking, completeBooking, cancelBooking } from "../api/bookings";
import AssignDriverModal from "./AssignDriverModal";
import styles from "./BookingTable.module.css";

const badgeColors = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  assigned: { bg: "#dbeafe", color: "#1e40af" },
  completed: { bg: "#dcfce7", color: "#166534" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

const StatusBadge = ({ status }) => {
  const c = badgeColors[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.color }}>
      {status}
    </span>
  );
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
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Phone</th>
              <th className={styles.th}>Pickup</th>
              <th className={styles.th}>Drop</th>
              <th className={styles.th}>City</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Driver</th>
              <th className={styles.th}>Journey</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className={styles.cell}>{b.customerName}</td>
                <td className={styles.cell}>{b.customerPhone}</td>
                <td className={styles.cell}>{b.pickupAddress}</td>
                <td className={styles.cell}>{b.dropAddress}</td>
                <td className={styles.cell}>{b.city}</td>
                <td className={styles.cell}><StatusBadge status={b.status} /></td>
                <td className={styles.cell}>{b.driverId?.name || "-"}</td>
                <td className={styles.dateCell}>
                  {new Date(b.journeyStart).toLocaleString()}
                </td>
                <td className={styles.cell}>
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
                <td colSpan={9} className={styles.emptyCell}>No bookings found</td>
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
    ["pending", "assigned"].includes(booking.status) &&
    ["admin", "manager", "driver", "customer"].includes(user?.role);

  return (
    <div className={styles.actions}>
      {canAssign && <button className={styles.btn} onClick={onAssign}>Assign</button>}
      {canUnassign && <button className={styles.btnUnassign} onClick={onUnassign}>Unassign</button>}
      {canComplete && <button className={styles.btnComplete} onClick={onComplete}>Complete</button>}
      {canCancel && <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>}
    </div>
  );
}
