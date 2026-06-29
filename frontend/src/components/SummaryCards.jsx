import styles from "./SummaryCards.module.css";

const statusColors = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const labels = {
  pending: "Pending",
  assigned: "Assigned",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function SummaryCards({ bookings }) {
  const counts = {};
  for (const b of bookings) {
    const s = b.status;
    counts[s] = (counts[s] || 0) + 1;
  }

  const total = bookings.length;
  const cards = ["pending", "assigned", "completed", "cancelled"];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.count}>{total}</div>
        <div className={styles.label}>Total</div>
      </div>
      {cards.map((status) => (
        <div
          key={status}
          className={styles.card}
          style={{
            border: `1px solid ${statusColors[status]}40`,
            borderLeft: `4px solid ${statusColors[status]}`,
          }}
        >
          <div className={styles.count} style={{ color: statusColors[status] }}>
            {counts[status] || 0}
          </div>
          <div className={styles.label}>{labels[status]}</div>
        </div>
      ))}
    </div>
  );
}
