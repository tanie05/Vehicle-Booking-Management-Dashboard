import styles from "./SummaryCards.module.css";

const CARDS = [
  { status: "pending", label: "Pending", color: "#f59e0b" },
  { status: "driver_assigned", label: "Assigned", color: "#3b82f6" },
  { status: "trip_in_progress", label: "Active", color: "#059669" },
  { status: "completed", label: "Completed", color: "#22c55e" },
  { status: "driver_rejected", label: "Rejected", color: "#e11d48" },
  { status: "assignment_timeout", label: "Timed Out", color: "#dc2626" },
  { status: "cancelled", label: "Cancelled", color: "#94a3b8" },
];

export default function SummaryCards({ bookings }) {
  const counts = {};
  for (const b of bookings) {
    counts[b.status] = (counts[b.status] || 0) + 1;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.count}>{bookings.length}</div>
        <div className={styles.label}>Total</div>
      </div>
      {CARDS.map(({ status, label, color }) => (
        <div key={status} className={styles.card}
          style={{ border: `1px solid ${color}40`, borderLeft: `4px solid ${color}` }}>
          <div className={styles.count} style={{ color }}>{counts[status] || 0}</div>
          <div className={styles.label}>{label}</div>
        </div>
      ))}
    </div>
  );
}
