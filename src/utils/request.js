import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const request = axios.create({
  baseURL: API_BASE_URL + '/api', // 注意：这里统一加上了 /api 前缀
  timeout: 5000,
});

// 响应拦截器：直接提取后端返回的 data，简化组件逻辑
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default request;