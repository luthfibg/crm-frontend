import axios from 'axios';

console.log('MODE:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

// Determine base URL based on environment
let baseURL;

if (isTauri) {
  // Tauri desktop app
  baseURL = 'http://127.0.0.1:8000/api';
} else if (import.meta.env.VITE_API_URL) {
  // Use environment variable if available
  baseURL = import.meta.env.VITE_API_URL;
} else {
  // Fallback based on development vs production
  baseURL = import.meta.env.MODE === 'production' 
    ? 'https://crm-backend-production-0b0c.up.railway.app/api' 
    : 'http://localhost:8000/api';
}

console.log('Final baseURL:', baseURL);
console.log('Is Tauri:', isTauri);
console.log('Environment MODE:', import.meta.env.MODE);

if (!baseURL) {
  alert("VITE_API_URL IS EMPTY AND NO FALLBACK AVAILABLE");
}

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔐 Request to:', config.baseURL + config.url);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔓 Unauthorized - clearing token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
