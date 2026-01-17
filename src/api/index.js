import { request } from '../utils/request';

export const api = {
  auth: {
    login: (data) => request('/api/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/api/register', { method: 'POST', body: JSON.stringify(data) }),
    verify: (id) => request(`/api/verify?id=${id}`),
  },
  clinic: {
    getLocations: () => request('/api/clinic-locations'),
  },
  visitors: {
    getAll: (userId) => request(`/api/visitors?userId=${userId}`),
    create: (data) => request('/api/visitors', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/visitors/${id}`, { method: 'DELETE' }),
  },
  appointment: {
    create: (data) => request('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: (userId) => request(`/api/appointments?userId=${userId}`),
  },
  admin: {
    getAllData: () => request('/api/admin/all'),
  }
};