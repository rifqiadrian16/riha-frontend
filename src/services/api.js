import axios from "axios";

const BACKEND_URL = "https://c4f4-103-157-48-46.ngrok-free.app";
const API_URL = import.meta.env.VITE_API_URL/api || `${BACKEND_URL}/api`;

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
