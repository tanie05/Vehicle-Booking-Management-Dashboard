import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useBookings from "../hooks/useBookings";
import BookingFilters from "../components/BookingFilters";
import BookingTable from "../components/BookingTable";
import SummaryCards from "../components/SummaryCards";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    status: "", city: "", today: false, yesterday: false, search: "",
  });
  const { bookings, loading, refresh } = useBookings(filters);

  if (!["admin", "manager"].includes(user?.role)) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
        <p style={{ color: "#64748b", fontSize: 15 }}>
          Only admins and managers can access the dashboard.
        </p>
        <button onClick={logout} style={{
          marginTop: 12, padding: "8px 20px", borderRadius: 6,
          border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer",
        }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
      }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ fontSize: 14 }}>
          <span>
            {user?.name} ({user?.role})
            {user?.city && ` \u2014 ${user.city}`}
          </span>
          <button onClick={logout} style={{
            marginLeft: 12, padding: "4px 12px", borderRadius: 4,
            border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13,
          }}>
            Logout
          </button>
        </div>
      </div>

      <BookingFilters filters={filters} setFilters={setFilters} user={user} />

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading bookings...</p>
      ) : (
        <>
          <SummaryCards bookings={bookings} />
          <BookingTable bookings={bookings} onRefresh={refresh} user={user} />
        </>
      )}
    </div>
  );
}
