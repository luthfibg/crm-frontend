import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.26/api',
  // baseURL: 'http://backend.test/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
