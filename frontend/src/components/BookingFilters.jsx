import { useState, useEffect } from "react";
import { getCities } from "../api/bookings";
import styles from "./BookingFilters.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "driver_assigned", label: "Driver Assigned" },
  { value: "driver_accepted", label: "Accepted" },
  { value: "going_to_pickup", label: "Going to Pickup" },
  { value: "driver_arrived", label: "Arrived" },
  { value: "customer_onboarded", label: "Onboarded" },
  { value: "trip_in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "driver_rejected", label: "Rejected" },
  { value: "assignment_timeout", label: "Timed Out" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingFilters({ filters, setFilters, user }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    getCities().then((res) => setCities(res.data.data)).catch(() => {});
  }, [user?.role]);

  const handle = (key, value) => setFilters({ ...filters, [key]: value });
  const clear = () => setFilters({ status: "", city: "", date: ""});

  return (
    <div className={styles.container}>
      <select value={filters.status} onChange={(e) => handle("status", e.target.value)} className={styles.select}>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {user?.role === "admin" && (
        <select value={filters.city} onChange={(e) => handle("city", e.target.value)} className={styles.select}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      <input type="date" value={filters.date || ""}
        onChange={(e) => handle("date", e.target.value)} className={styles.select}
        max={new Date().toISOString().split("T")[0]} />

      <button onClick={clear} className={styles.clearBtn}>Clear</button>
    </div>
  );
}
