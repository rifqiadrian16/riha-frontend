// src/utils/alert.js
import Swal from "sweetalert2";

// 1. Alert Sukses/Gagal Standar
export const showAlert = (title, text, icon = "success") => {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: "#1d64f2", // Warna biru sesuai tema RiHa
    confirmButtonText: "OK",
  });
};

// 2. Alert Konfirmasi (Ya/Tidak) - Pengganti confirm()
export const showConfirm = async (
  title,
  text,
  confirmText = "Ya, Lanjutkan",
) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1d64f2",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
};

// 3. Toast Kecil di Pojok Kanan Atas (Opsional, lebih halus)
export const showToast = (title, icon = "success") => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  return Toast.fire({
    icon: icon,
    title: title,
  });
};
