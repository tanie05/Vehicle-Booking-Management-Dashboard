const statusColors = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
  due: "#dc2626",
};

const labels = {
  pending: "Pending",
  assigned: "Assigned",
  completed: "Completed",
  cancelled: "Cancelled",
  due: "Due",
};

export default function SummaryCards({ bookings }) {
  const counts = {};
  for (const b of bookings) {
    const s = b.status;
    counts[s] = (counts[s] || 0) + 1;
  }

  const total = bookings.length;
  const cards = ["pending", "assigned", "completed", "cancelled", "due"];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
      <div
        style={{
          flex: 1,
          minWidth: 120,
          padding: "12px 16px",
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700 }}>{total}</div>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
          Total
        </div>
      </div>
      {cards.map((status) => (
        <div
          key={status}
          style={{
            flex: 1,
            minWidth: 120,
            padding: "12px 16px",
            borderRadius: 8,
            background: "#f8fafc",
            border: `1px solid ${statusColors[status]}40`,
            borderLeft: `4px solid ${statusColors[status]}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: statusColors[status] }}>
            {counts[status] || 0}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
            {labels[status]}
          </div>
        </div>
      ))}
    </div>
  );
}
