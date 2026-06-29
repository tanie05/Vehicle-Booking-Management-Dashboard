import { useState, useEffect } from "react";
import { getBookings } from "../api/bookings";

export default function BookingFilters({ filters, setFilters, user }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="">All cities</option>
          <option value="Delhi">Delhi</option>
          <option value="Gurugram">Gurugram</option>
          <option value="Bangalore">Bangalore</option>
        </select>
      )}

      <label>
        <input
          type="checkbox"
          checked={filters.today}
          onChange={(e) =>
            setFilters({ ...filters, today: e.target.checked, yesterday: false })
          }
        />
        Today
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.yesterday}
          onChange={(e) =>
            setFilters({ ...filters, yesterday: e.target.checked, today: false })
          }
        />
        Yesterday
      </label>

      <button onClick={() => setFilters({ status: "", city: "", today: false, yesterday: false })}>
        Clear
      </button>
    </div>
  );
}
