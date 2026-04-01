import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/api/notifications');
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get('/api/notifications/unread-count');
  return res.data.count;
};

export const markRead = async (id) => {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const res = await api.patch('/api/notifications/read-all');
  return res.data;
};

export const clearReadNotifications = async () => {
  const res = await api.delete('/api/notifications/read');
  return res.data;
};
