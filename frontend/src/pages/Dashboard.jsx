import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useBookings from "../hooks/useBookings";
import BookingFilters from "../components/BookingFilters";
import BookingTable from "../components/BookingTable";
import SummaryCards from "../components/SummaryCards";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    status: "", city: "", today: false, yesterday: false, search: "",
  });
  const { bookings, loading, refresh } = useBookings(filters);

  if (!["admin", "manager"].includes(user?.role)) {
    return (
      <div className={styles.denied}>
        <h2 className={styles.deniedHeading}>Access Denied</h2>
        <p className={styles.deniedText}>
          Only admins and managers can access the dashboard.
        </p>
        <button onClick={logout} className={styles.deniedBtn}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Dashboard</h2>
        <div className={styles.userInfo}>
          <span>
            {user?.name} ({user?.role})
            {user?.city && ` \u2014 ${user.city}`}
          </span>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <BookingFilters filters={filters} setFilters={setFilters} user={user} />

      {loading ? (
        <p className={styles.loading}>Loading bookings...</p>
      ) : (
        <>
          <SummaryCards bookings={bookings} />
          <BookingTable bookings={bookings} onRefresh={refresh} user={user} />
        </>
      )}
    </div>
  );
}
