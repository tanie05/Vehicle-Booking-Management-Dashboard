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
    if (filters.date) p.date = filters.date;
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
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
      "booking-created", "booking-assigned", "booking-unassigned",
      "booking-accepted", "booking-rejected", "booking-going-to-pickup",
      "booking-arrived", "booking-onboarded", "booking-trip-started",
      "booking-completed", "booking-cancelled", "booking-timeout",
    ],
    []
  );

  useSocket(socketEvents, fetchBookings);

  return { bookings, loading, refresh: fetchBookings };
}
