import { useState, useEffect, useCallback, useMemo } from "react";
import { getBookings } from "../api/bookings";
import useSocket from "./useSocket";

export default function useBookings(filters) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const p = {};
    if (filters.status) p.status = filters.status;
    if (filters.city) p.city = filters.city;
    if (filters.today) p.today = true;
    if (filters.yesterday) p.yesterday = true;
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getBookings(params);
      setBookings(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const socketEvents = useMemo(
    () => [
      "booking-created",
      "booking-assigned",
      "booking-unassigned",
      "booking-completed",
      "booking-cancelled",
    ],
    []
  );

  useSocket(socketEvents, fetchBookings);

  return { bookings, loading, refresh: fetchBookings };
}
