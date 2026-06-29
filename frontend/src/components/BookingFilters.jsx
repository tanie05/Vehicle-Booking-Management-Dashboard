import { useState, useEffect } from "react";
import { getCities } from "../api/bookings";
import styles from "./BookingFilters.module.css";

export default function BookingFilters({ filters, setFilters, user }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    getCities()
      .then((res) => setCities(res.data.data))
      .catch(() => {});
  }, [user?.role]);

  const handleChange = (key, value) =>
    setFilters({ ...filters, [key]: value });

  const clear = () =>
    setFilters({ status: "", city: "", today: false, yesterday: false, search: "" });

  return (
    <div className={styles.container}>
      <select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
        className={styles.select}
      >
        <option value="">All status</option>
        <option value="pending">Pending</option>
        <option value="assigned">Assigned</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {user?.role === "admin" && (
        <select
          value={filters.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className={styles.select}
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={filters.today}
          onChange={(e) =>
            setFilters({ ...filters, today: e.target.checked, yesterday: false })
          }
        />
        Today
      </label>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={filters.yesterday}
          onChange={(e) =>
            setFilters({ ...filters, yesterday: e.target.checked, today: false })
          }
        />
        Yesterday
      </label>

      <input
        type="text"
        placeholder="Search..."
        value={filters.search || ""}
        onChange={(e) => handleChange("search", e.target.value)}
        className={styles.searchInput}
      />

      <button onClick={clear} className={styles.clearBtn}>
        Clear
      </button>
    </div>
  );
}
