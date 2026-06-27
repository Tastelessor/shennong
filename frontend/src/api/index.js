import request from '../utils/request';

export const api = {
  user: {
    getProfile: (id) => request.get(`/user/profile/${id}`),
    bindInviter: (userId, inviterId) => request.post('/user/bind-inviter', { userId, inviterId }),
    updatePassword: (data) => request.post('/user/update-password', data),
    getInviteStats: (userId) => request.get(`/user/invite-stats/${userId}`),
  },
  partner: {
    apply: (formData) => request.post('/partner/apply', formData), // Axios 会自动处理 FormData 的 Header
    getStatus: (userId) => request.get(`/partner/status/${userId}`),
    getAllApplications: () => request.get('/admin/partner-applications'),
    approve: (appId) => request.post(`/admin/partner-approve/${appId}`),
    revoke: (id) => request.post(`/partner/revoke/${id}`),
    getTree: (id) => request.get(`/partner/tree/${id}`),
  },
  auth: {
    login: (data) => request.post('/login', data),
    register: (data) => request.post('/register', data),
    verify: (id) => request.get('/verify', { params: { id } }),
  },
  clinic: {
    getLocations: () => request.get('/clinic-locations'),
  },
  visitors: {
    getAll: (userId) => request.get('/visitors', { params: { userId } }),
    create: (data) => request.post('/visitors', data),
    delete: (id) => request.delete(`/visitors/${id}`),
  },
  appointment: {
    create: (data) => request.post('/appointments', data),
    getHistory: (userId) => request.get('/appointments', { params: { userId } }),
    process: (id) => request.post(`/admin/appointment-process/${id}`),
  },
  admin: {
    getAllData: () => request.get('/admin/all'),
    getStats: (period) => request.get('/admin/stats', { params: { period } }), // [新增]
    getPartnersDetailed: () => request.get('/admin/partners-detailed'), // [新增]
  },
  agent: {
    getSession: () => request.get('/agent/sessions'),
  },
  chat: {
    getHistory: (roomId) => request.get('/chat/history', { params: { roomId } }),
    markRead: (roomId) => request.post('/chat/read', { roomId }),
  }
};