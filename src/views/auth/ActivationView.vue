<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../services/api";

const route = useRoute();
const router = useRouter();

const status = ref("loading"); // loading, success, error
const message = ref("Sedang memverifikasi akun Anda...");

onMounted(async () => {
  // Ambil token dari URL: http://localhost:5173/activate-account?token=XYZ
  const token = route.query.token;

  if (!token) {
    status.value = "error";
    message.value = "Token aktivasi tidak ditemukan.";
    return;
  }

  try {
    // Kirim token ke backend
    await api.post("/auth/activate", { token });

    status.value = "success";
    message.value = "Akun berhasil diaktifkan!";
  } catch (error) {
    status.value = "error";
    message.value =
      error.response?.data?.msg ||
      "Gagal mengaktifkan akun. Link mungkin kedaluwarsa.";
  }
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans"
  >
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div v-if="status === 'loading'">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <h2 class="text-xl font-bold text-gray-700">Memproses...</h2>
        <p class="text-gray-500">{{ message }}</p>
      </div>

      <div v-else-if="status === 'success'">
        <div
          class="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-green-600 mb-2">Berhasil!</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <button
          @click="router.push('/login')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Login Sekarang
        </button>
      </div>

      <div v-else>
        <div
          class="bg-red-100 text-red-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-red-600 mb-2">Gagal</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <button
          @click="router.push('/register')"
          class="text-blue-600 hover:underline font-bold"
        >
          Daftar Ulang
        </button>
      </div>
    </div>
  </div>
</template>
