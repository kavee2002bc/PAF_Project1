import api from './api';

export const register = async (data) => {
  const res = await api.post('/api/auth/register', data);
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data; // { token, id, name, email, role, profilePicture }
};

export const getMe = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};
