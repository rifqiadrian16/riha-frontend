import axios from "axios";

const BACKEND_URL = "riha-backend-production.up.railway.app";
const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR (Tetap sama seperti sebelumnya)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
