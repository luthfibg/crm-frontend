import axios from 'axios';

console.log('MODE:', import.meta.env.MODE);
console.log('API:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

// PC Server's URL
// const baseURL = import.meta.env.VITE_API_URL ||
//   (isTauri ? 'http://127.0.0.1:8000/api' : 'http://crm-backend.local/api');

//local PC Dev URL
// const baseURL = 'http://backend.test/api';

// Railway deployment URL
const baseURL = 'https://crm-backend-production-0b0c.up.railway.app/api';

console.log('Final baseURL:', baseURL);
console.log('Is Tauri:', isTauri);

if (!baseURL) {
  alert("VITE_API_URL IS EMPTY - Using fallback");
}
const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
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
