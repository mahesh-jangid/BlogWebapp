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
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Let the application handle 401 errors through Redux and component logic
    // Don't auto-redirect to avoid disrupting user experience
    return Promise.reject(error);
  }
);

export default api;