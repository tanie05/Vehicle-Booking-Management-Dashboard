import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getBookings } from "../api/bookings";
import { getSocket } from "../sockets";
import BookingFilters from "../components/BookingFilters";
import BookingTable from "../components/BookingTable";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    city: "",
    today: false,
    yesterday: false,
  });

  const fetchBookings = useCallback(async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.city) params.city = filters.city;
    if (filters.today) params.today = true;
    if (filters.yesterday) params.yesterday = true;
    const res = await getBookings(params);
    setBookings(res.data.data);
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const events = [
      "booking-created",
      "booking-assigned",
      "booking-unassigned",
      "booking-completed",
      "booking-cancelled",
    ];

    const handler = () => fetchBookings();
    events.forEach((e) => socket.on(e, handler));

    return () => {
      events.forEach((e) => socket.off(e, handler));
    };
  }, [fetchBookings]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Dashboard</h2>
        <div>
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
        </div>
      </div>

      <BookingFilters filters={filters} setFilters={setFilters} user={user} />
      <BookingTable bookings={bookings} onRefresh={fetchBookings} user={user} />
    </div>
  );
}
