import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor - token is sent automatically in cookies via withCredentials
api.interceptors.request.use(
  (config) => {
    // HttpOnly cookies are auto-sent with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and token expiry
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      if (typeof window !== 'undefined') {
        // Cookie is automatically cleared by backend
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
