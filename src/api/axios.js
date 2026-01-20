import axios from 'axios';

console.log('MODE:', import.meta.env.MODE);
console.log('API:', import.meta.env.VITE_API_URL);

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  alert("VITE_API_URL IS EMPTY");
}
const api = axios.create({
  baseURL,
  withCredentials: false,
  // baseURL: 'http://backend.test/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: "application/json",
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
