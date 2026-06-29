import { useState, useEffect } from "react";
import { getDrivers } from "../api/drivers";
import { assignBooking, completeBooking, cancelBooking } from "../api/bookings";

export default function BookingTable({ bookings, onRefresh, user }) {
  return (
    <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Phone</th>
          <th>Pickup</th>
          <th>Drop</th>
          <th>City</th>
          <th>Status</th>
          <th>Driver</th>
          <th>Booked At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b._id}>
            <td>{b.customerName}</td>
            <td>{b.customerPhone}</td>
            <td>{b.pickupLocation}</td>
            <td>{b.dropLocation}</td>
            <td>{b.city}</td>
            <td>{b.status}</td>
            <td>{b.driverRef?.name || "-"}</td>
            <td>{new Date(b.bookingTime).toLocaleString()}</td>
            <td>
              <RowActions booking={b} onRefresh={onRefresh} user={user} />
            </td>
          </tr>
        ))}
        {bookings.length === 0 && (
          <tr>
            <td colSpan="9" style={{ textAlign: "center" }}>
              No bookings found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function RowActions({ booking, onRefresh, user }) {
  const [showAssign, setShowAssign] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");

  const loadDrivers = async () => {
    const params = {};
    if (user.city) params.city = user.city;
    params.availability = "true";
    const res = await getDrivers(params);
    setDrivers(res.data.data);
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!selectedDriver) return;
    await assignBooking(booking._id, selectedDriver);
    setShowAssign(false);
    onRefresh();
  };

  const handleComplete = async () => {
    await completeBooking(booking._id);
    onRefresh();
  };

  const handleCancel = async () => {
    const reason = prompt("Reason for cancellation:");
    if (reason === null) return;
    await cancelBooking(booking._id, reason);
    onRefresh();
  };

  const canAssign =
    booking.status === "pending" &&
    ["admin", "manager"].includes(user?.role);
  const canComplete =
    booking.status === "assigned" &&
    ["admin", "manager", "driver"].includes(user?.role);
  const canCancel =
    ["pending", "assigned"].includes(booking.status) &&
    ["admin", "manager", "driver", "customer"].includes(user?.role);

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {canAssign && <button onClick={loadDrivers}>Assign</button>}
      {canComplete && <button onClick={handleComplete}>Complete</button>}
      {canCancel && <button onClick={handleCancel}>Cancel</button>}

      {showAssign && (
        <div style={{ display: "inline-flex", gap: 4 }}>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
          >
            <option value="">Select driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} - {d.city}
              </option>
            ))}
          </select>
          <button onClick={handleAssign} disabled={!selectedDriver}>
            Confirm
          </button>
          <button onClick={() => setShowAssign(false)}>X</button>
        </div>
      )}
    </div>
  );
}
