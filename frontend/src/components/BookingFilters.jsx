import { useState, useEffect } from "react";
import { getCities } from "../api/bookings";

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
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
        style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #cbd5e1" }}
      >
        <option value="">All status</option>
        <option value="pending">Pending</option>
        <option value="assigned">Assigned</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="due">Due</option>
      </select>

      {user?.role === "admin" && (
        <select
          value={filters.city}
          onChange={(e) => handleChange("city", e.target.value)}
          style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #cbd5e1" }}
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="checkbox"
          checked={filters.today}
          onChange={(e) =>
            setFilters({ ...filters, today: e.target.checked, yesterday: false })
          }
        />
        Today
      </label>

      <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
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
        style={{
          padding: "4px 8px",
          borderRadius: 4,
          border: "1px solid #cbd5e1",
          fontSize: 14,
          flex: 1,
          minWidth: 160,
        }}
      />

      <button
        onClick={clear}
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          border: "1px solid #cbd5e1",
          background: "#fff",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Clear
      </button>
    </div>
  );
}
