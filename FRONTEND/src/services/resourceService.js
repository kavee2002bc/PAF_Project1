import api from './api';

export const getResources = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type)        params.append('type', filters.type);
  if (filters.status)      params.append('status', filters.status);
  if (filters.location)    params.append('location', filters.location);
  if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
  const res = await api.get(`/api/resources?${params}`);
  return res.data;
};

export const getResourceById = async (id) => {
  const res = await api.get(`/api/resources/${id}`);
  return res.data;
};

export const createResource = async (resource) => {
  const res = await api.post('/api/resources', resource);
  return res.data;
};

export const updateResource = async (id, resource) => {
  const res = await api.put(`/api/resources/${id}`, resource);
  return res.data;
};

export const deleteResource = async (id) => {
  await api.delete(`/api/resources/${id}`);
  return true;
};
