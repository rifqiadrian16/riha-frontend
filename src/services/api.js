import axios from "axios";

// [PERBAIKAN DISINI]
// Kita cek: Apakah ada VITE_API_URL dari Vercel?
// Jika ADA, pakai link Ngrok itu.
// Jika TIDAK ADA (di laptop), pakai localhost.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
