import axios from 'axios';

const api = axios.create({
  baseURL: 'http://backend.test/api',
  // baseURL: 'http://192.168.1.10/api',
  withCredentials: true, // Penting untuk Sanctum
});

// Interceptor untuk menyisipkan token secara otomatis di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;