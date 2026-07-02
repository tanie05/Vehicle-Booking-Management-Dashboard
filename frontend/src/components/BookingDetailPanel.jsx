import styles from "./BookingDetailPanel.module.css";

const TIMELINE_CONFIG = {
  assignedAt: { label: "Assigned" },
  acceptedAt: { label: "Accepted" },
  goingToPickupAt: { label: "Going to Pickup" },
  arrivedAt: { label: "Arrived" },
  onboardedAt: { label: "Onboarded" },
  tripStartedAt: { label: "Trip Started" },
  completedAt: { label: "Completed" },
  rejectedAt: { label: "Rejected" },
  timedOutAt: { label: "Timed Out" },
  cancelledAt: { label: "Cancelled" },
};

export default function BookingDetailPanel({ booking, onClose }) {
  const driver = booking.driverId;

  const timelineEntries = Object.entries(TIMELINE_CONFIG).filter(([key]) =>
    !!booking[key]
  );

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Booking Details</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Customer</h4>
          <div className={styles.row}><span className={styles.label}>Name</span><span>{booking.customerName}</span></div>
          <div className={styles.row}><span className={styles.label}>Phone</span><span>{booking.customerPhone}</span></div>
          <div className={styles.row}><span className={styles.label}>ID</span><span className={styles.mono}>{booking._id}</span></div>
          <div className={styles.row}><span className={styles.label}>City</span><span>{booking.city}</span></div>
          <div className={styles.row}><span className={styles.label}>Pickup</span><span>{booking.pickupAddress}</span></div>
          <div className={styles.row}><span className={styles.label}>Drop</span><span>{booking.dropAddress}</span></div>
          <div className={styles.row}><span className={styles.label}>Status</span><span className={styles.status}>{booking.status}</span></div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Journey</h4>
          <div className={styles.row}><span className={styles.label}>Start</span><span>{new Date(booking.journeyStart).toLocaleString()}</span></div>
          <div className={styles.row}><span className={styles.label}>End</span><span>{new Date(booking.journeyEnd).toLocaleString()}</span></div>
        </div>

        {driver && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Driver</h4>
            <div className={styles.row}><span className={styles.label}>Name</span><span>{driver.name}</span></div>
            <div className={styles.row}><span className={styles.label}>Phone</span><span>{driver.phone || "-"}</span></div>
            <div className={styles.row}><span className={styles.label}>Email</span><span>{driver.email}</span></div>
            <div className={styles.row}><span className={styles.label}>ID</span><span className={styles.mono}>{driver._id}</span></div>
            <div className={styles.row}><span className={styles.label}>Vehicle</span><span>{driver.vehicleModel} ({driver.vehicleCategory})</span></div>
            <div className={styles.row}><span className={styles.label}>Number</span><span>{driver.vehicleNumber || "-"}</span></div>
            <div className={styles.row}><span className={styles.label}>Seats</span><span>{driver.seatingCapacity || "-"}</span></div>
            <div className={styles.row}><span className={styles.label}>Status</span><span>{driver.driverStatus}</span></div>
          </div>
        )}

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Timeline</h4>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineLabel}>Created</span>
                <span className={styles.timelineTime}>{new Date(booking.createdAt).toLocaleString()}</span>
              </div>
            </div>
            {timelineEntries.map(([key, config]) => {
              const ts = booking[key];
              if (!ts) return null;
              return (
                <div key={key} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>{config.label}</span>
                    <span className={styles.timelineTime}>{new Date(ts).toLocaleString()}</span>
                    {key === "rejectedAt" && booking.rejectionReason && (
                      <span className={styles.reason}>Reason: {booking.rejectionReason}</span>
                    )}
                    {key === "cancelledAt" && booking.cancellationReason && (
                      <span className={styles.reason}>Reason: {booking.cancellationReason}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
