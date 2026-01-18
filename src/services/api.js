// src/services/api.js
import axios from "axios";

// Buat instance axios yang mengarah ke backend Anda
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Sesuaikan dengan port backend Anda
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR (PENTING!)
// Ini tugasnya otomatis menyelipkan Token di setiap request jika user sudah login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Kita akan simpan token di sini nanti
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
