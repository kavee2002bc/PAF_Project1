import api from './api';

export const getAllBookings = async () => {
  const res = await api.get('/api/bookings');
  return res.data;
};

export const getMyBookings = async () => {
  const res = await api.get('/api/bookings/my');
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/api/bookings/${id}`);
  return res.data;
};

export const createBooking = async (booking) => {
  const res = await api.post('/api/bookings', booking);
  return res.data;
};

export const updateBookingStatus = async (id, status, reason = '') => {
  const res = await api.patch(`/api/bookings/${id}/status`, { status, reason });
  return res.data;
};
