import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // cookies support
});

// ✅ Request interceptor - Add Bearer Token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (if stored there)
    // This runs on every request to ensure fresh token is used
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request header');
      } else {
        // If no token in localStorage, still allow request with cookies
        // Delete Authorization header to avoid sending undefined
        if (config.headers.Authorization) {
          delete config.headers.Authorization;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle errors (DO NOT auto-redirect on 401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log token issues for debugging
    if (error.response?.status === 401) {
      console.warn('⚠️ 401 Unauthorized - Token may be invalid or missing');
    }
    // Let the application handle 401 errors through Redux and component logic
    // Don't auto-redirect to avoid disrupting user experience
    return Promise.reject(error);
  }
);

export default api;