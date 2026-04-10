import api from './api';

export const getAllTickets = async () => {
  const res = await api.get('/api/tickets');
  return res.data;
};

export const getMyTickets = async () => {
  const res = await api.get('/api/tickets/my');
  return res.data;
};

export const getTicketById = async (id) => {
  const res = await api.get(`/api/tickets/${id}`);
  return res.data;
};

/** ticketData: TicketRequest JSON, files: FileList or File[] (optional, max 3) */
export const createTicket = async (ticketData, files = []) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(ticketData));
  files.forEach(f => formData.append('files', f));
  const res = await api.post('/api/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateTicketStatus = async (id, status, notes = '', rejectionReason = '') => {
  const res = await api.patch(`/api/tickets/${id}/status`, { status, notes, rejectionReason });
  return res.data;
};

export const assignTicket = async (id, assignedToId) => {
  const res = await api.patch(`/api/tickets/${id}/status`, { assignedToId });
  return res.data;
};

export const addComment = async (ticketId, text) => {
  const res = await api.post(`/api/tickets/${ticketId}/comments`, { text });
  return res.data;
};

export const editComment = async (ticketId, commentId, text) => {
  const res = await api.put(`/api/tickets/${ticketId}/comments/${commentId}`, { text });
  return res.data;
};

export const deleteComment = async (ticketId, commentId) => {
  await api.delete(`/api/tickets/${ticketId}/comments/${commentId}`);
  return true;
};
