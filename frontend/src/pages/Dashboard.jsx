import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useBookings from "../hooks/useBookings";
import BookingFilters from "../components/BookingFilters";
import BookingTable from "../components/BookingTable";
import SummaryCards from "../components/SummaryCards";
import BookingDetailPanel from "../components/BookingDetailPanel";
import styles from "./Dashboard.module.css";

function SkeletonCards() {
  return (
    <div className={styles.container}>
      {[1,2,3,4].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonLine} style={{ width: "40%", height: 24 }} />
          <div className={styles.skeletonLine} style={{ width: "60%", height: 12, marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div>
      {[1,2,3].map((i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonLine} style={{ width: "30%" }} />
          <div className={styles.skeletonLine} style={{ width: "20%" }} />
          <div className={styles.skeletonLine} style={{ width: "25%" }} />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    status: "", city: "", date: "", search: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { bookings, loading, refresh } = useBookings(filters);

  if (!user) return null;

  const isDriver = user.role === "driver";
  const showDashboard = ["admin", "manager"].includes(user?.role) || isDriver;

  if (!showDashboard) {
    return (
      <div className={styles.denied}>
        <h2 className={styles.deniedHeading}>Access Denied</h2>
        <p className={styles.deniedText}>Only admins, managers, and drivers can access the dashboard.</p>
        <button onClick={logout} className={styles.deniedBtn}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Dashboard {isDriver && <span className={styles.driverBadge}>Driver View</span>}</h2>
        <div className={styles.userInfo}>
          <span>{user?.name} ({user?.role}){user?.city && ` — ${user.city}`}</span>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {!isDriver && <BookingFilters filters={filters} setFilters={setFilters} user={user} />}

      {loading ? (
        <>
          <SkeletonCards />
          <SkeletonTable />
        </>
      ) : (
        <>
          <SummaryCards bookings={bookings} />
          <BookingTable bookings={bookings} onRefresh={refresh} user={user} onViewTimeline={setSelectedBooking} />
        </>
      )}

      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
