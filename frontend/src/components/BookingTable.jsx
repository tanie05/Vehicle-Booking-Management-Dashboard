import { useState } from "react";
import { assignBooking, unassignBooking, acceptBooking, rejectBooking, updateBookingStatus, completeBooking, cancelBooking } from "../api/bookings";
import AssignDriverModal from "./AssignDriverModal";
import styles from "./BookingTable.module.css";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e" },
  driver_assigned: { label: "Driver Assigned", bg: "#dbeafe", color: "#1e40af" },
  driver_accepted: { label: "Accepted", bg: "#e0f2fe", color: "#075985" },
  going_to_pickup: { label: "Going to Pickup", bg: "#f0fdf4", color: "#166534" },
  driver_arrived: { label: "Arrived", bg: "#fefce8", color: "#854d0e" },
  customer_onboarded: { label: "Onboarded", bg: "#f5f3ff", color: "#5b21b6" },
  trip_in_progress: { label: "In Progress", bg: "#ecfdf5", color: "#065f46" },
  completed: { label: "Completed", bg: "#dcfce7", color: "#166534" },
  driver_rejected: { label: "Rejected", bg: "#fff1f2", color: "#9f1239" },
  assignment_timeout: { label: "Timed Out", bg: "#fef2f2", color: "#991b1b" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || { label: status, bg: "#f1f5f9", color: "#475569" };
  const isTimeout = status === "assignment_timeout";
  return (
    <span
      className={styles.badge}
      style={{
        background: c.bg, color: c.color,
        animation: isTimeout ? "pulse 1.5s infinite" : "none",
      }}
    >
      {c.label}
    </span>
  );
};

export default function BookingTable({ bookings, onRefresh, user, onViewTimeline }) {
  const [assignFor, setAssignFor] = useState(null);

  const handleAssign = async (id, driverId) => {
    try {
      await assignBooking(id, driverId);
    } catch (e) { /* error handled in modal */ }
    setAssignFor(null);
    onRefresh();
  };

  const handleAccept = async (id) => { try { await acceptBooking(id); } catch (e) { alert(e.response?.data?.message || e.message); } onRefresh(); };
  const handleReject = async (id) => {
    const reason = prompt("Rejection reason:");
    if (!reason || !reason.trim()) return alert("Rejection reason is required.");
    try { await rejectBooking(id, reason); } catch (e) { alert(e.response?.data?.message || e.message); }
    onRefresh();
  };
  const handleStatus = async (id, status) => {
    try { await updateBookingStatus(id, status); } catch (e) { alert(e.response?.data?.message || e.message); }
    onRefresh();
  };
  const handleUnassign = async (id) => {
    if (!window.confirm("Unassign driver?")) return;
    try { await unassignBooking(id); } catch (e) { alert(e.response?.data?.message || e.message); }
    onRefresh();
  };
  const handleComplete = async (id) => { try { await completeBooking(id); } catch (e) { alert(e.response?.data?.message || e.message); } onRefresh(); };
  const handleCancel = async (id) => {
    const reason = prompt("Cancellation reason:");
    if (!reason || !reason.trim()) return alert("Cancellation reason is required.");
    try { await cancelBooking(id, reason); } catch (e) { alert(e.response?.data?.message || e.message); }
    onRefresh();
  };

  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.driverCol}`}>Driver</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className={b.status === "assignment_timeout" ? styles.timeoutRow : ""}>
                <td className={styles.cell}>
                  <strong>{b.customerName}</strong><br />
                  <span className={styles.muted}>{b.customerPhone}</span>
                </td>
                <td className={styles.cell}><StatusBadge status={b.status} /></td>
                <td className={`${styles.cell} ${styles.driverCol}`}>
                  {b.driverId ? (
                    <div>
                      <strong>{b.driverId.name}</strong><br />
                    </div>
                  ) : "-"}
                </td>
                <td className={styles.cell}>
                  <RowActions
                    booking={b} user={user}
                    onAssign={() => setAssignFor(b)}
                    onAccept={() => handleAccept(b._id)}
                    onReject={() => handleReject(b._id)}
                    onStatus={(s) => handleStatus(b._id, s)}
                    onUnassign={() => handleUnassign(b._id)}
                    onComplete={() => handleComplete(b._id)}
                    onCancel={() => handleCancel(b._id)}
                    onViewTimeline={() => onViewTimeline(b)}
                  />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyCell}>No bookings found</td></tr>
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

function RowActions({ booking, user, onAssign, onAccept, onReject, onStatus, onUnassign, onComplete, onCancel, onViewTimeline }) {
  const s = booking.status;
  const isMgr = ["admin", "manager"].includes(user?.role);
  const isDriver = user?.role === "driver";

  return (
    <div className={styles.actions}>
      <button className={styles.btnTimeline} onClick={onViewTimeline}>Details</button>

      {isMgr && (s === "pending" || s === "driver_rejected" || s === "assignment_timeout") &&
        <button className={styles.btn} onClick={onAssign}>Assign</button>}

      {isDriver && s === "driver_assigned" &&
        <button className={styles.btn} onClick={onAccept}>Accept</button>}
      {isDriver && s === "driver_assigned" &&
        <button className={styles.btnReject} onClick={onReject}>Reject</button>}

      {isDriver && s === "driver_accepted" &&
        <button className={styles.btn} onClick={() => onStatus("going_to_pickup")}>Go to Pickup</button>}
      {isDriver && s === "going_to_pickup" &&
        <button className={styles.btn} onClick={() => onStatus("driver_arrived")}>Arrived</button>}
      {isDriver && s === "driver_arrived" &&
        <button className={styles.btn} onClick={() => onStatus("customer_onboarded")}>Onboard</button>}
      {isDriver && s === "customer_onboarded" &&
        <button className={styles.btn} onClick={() => onStatus("trip_in_progress")}>Start Trip</button>}

      {isMgr && s === "driver_assigned" &&
        <button className={styles.btnUnassign} onClick={onUnassign}>Unassign</button>}

      {(isMgr || isDriver) && s === "trip_in_progress" &&
        <button className={styles.btnComplete} onClick={onComplete}>Complete</button>}

      {(isMgr || isDriver) && !["completed", "cancelled"].includes(s) &&
        <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>}
    </div>
  );
}
