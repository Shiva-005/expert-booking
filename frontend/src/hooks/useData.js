import { useState, useEffect, useCallback } from 'react';
import { expertApi, bookingApi } from '../services/api';

export const useExperts = () => {
  const [experts, setExperts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExperts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await expertApi.getExperts(params);
      setExperts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { experts, pagination, loading, error, fetchExperts };
};

export const useExpert = (id) => {
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpert = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await expertApi.getExpertById(id);
      setExpert(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpert();
  }, [fetchExpert]);

  const updateSlot = useCallback((date, timeSlot, isBooked) => {
    setExpert((prev) => {
      if (!prev) return prev;
      const newSlotsByDate = { ...prev.slotsByDate };
      if (newSlotsByDate[date]) {
        newSlotsByDate[date] = newSlotsByDate[date].map((slot) =>
          slot.time === timeSlot ? { ...slot, isBooked } : slot
        );
      }
      return { ...prev, slotsByDate: newSlotsByDate };
    });
  }, []);

  return { expert, loading, error, updateSlot };
};

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingsByEmail(email);
      setBookings(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { bookings, loading, error, fetchBookings };
};
