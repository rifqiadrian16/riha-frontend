<script setup>
import { showAlert, showToast } from "../../utils/alert"; // Import Helper
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import api from "../../services/api"; // Import konfigurasi API Anda

const router = useRouter(); // Untuk pindah halaman

// State input
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});

const handleLogin = async () => {
  try {
    // 1. Tembak API Login Backend
    const response = await api.post("/auth/login", {
      identifier: email.value,
      password: password.value,
    });

    // 2. Jika sukses, simpan token & data user
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.user.nama);
    localStorage.setItem("role", response.data.user.role);

    if (response.data.user.role === "admin") {
      await showToast("Login Berhasil", "success");
      router.push("/admin/antrean");
    } else {
      await showToast("Login Berhasil", "success");
      router.push("/dashboard");
    }
  } catch (error) {
    console.error(error);
    showAlert(
      "Gagal Masuk",
      error.response?.data.msg || "Cek Kredensial Anda",
      "error",
    );
  }
};
</script>

<template>
  <div class="flex w-full bg-white h-screen overflow-hidden font-sans">
    <div class="hidden lg:block lg:w-2/3 relative h-full group bg-gray-200">
      <img
        src="/images/bg-ilustrasi.png"
        alt="Background Rumah Sakit"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-in-out group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>

      <div class="absolute inset-0 flex items-center justify-center z-10 pb-20">
        <div
          class="bg-white rounded-full p-1 shadow-2xl h-48 w-48 flex items-center justify-center animate-float overflow-hidden"
        >
          <img
            src="/images/logo-riha.jpg"
            alt="Logo RiHa"
            class="h-full w-full object-cover rounded-full"
          />
        </div>
      </div>

      <div class="absolute bottom-0 w-full bg-[#1d64f2] py-4 text-center z-20">
        <h2
          class="text-white text-2xl font-bold tracking-wide shadow-black drop-shadow-md"
        >
          Sistem Antri Online<br />Rumah Sakit
        </h2>
      </div>
    </div>

    <div
      class="w-full lg:w-1/3 bg-white flex flex-col h-full shadow-2xl z-30 relative"
    >
      <div
        class="w-full bg-[#BFDBFE] py-5 text-center shadow-md shrink-0 z-50 relative border-b border-blue-200"
      >
        <h1 class="text-2xl font-extrabold tracking-tight">
          <span class="text-[#1d64f2]">RiHa</span>
          <span class="text-[#16a34a] ml-1">Medical Center</span>
        </h1>
      </div>

      <div
        class="flex-1 overflow-y-auto px-8 pt-8 lg:pt-12 pb-10 flex flex-col items-center transition-all duration-700 ease-out scroll-smooth"
        :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      >
        <div
          class="lg:hidden mb-6 bg-white p-1 rounded-full shadow-lg ring-1 ring-gray-100 overflow-hidden h-20 w-20 shrink-0"
        >
          <img
            src="/images/logo-riha.jpg"
            alt="Logo RiHa"
            class="h-full w-full object-cover rounded-full"
          />
        </div>

        <div class="w-full max-w-sm">
          <div class="text-center mb-8">
            <h3 class="text-blue-800 font-bold text-xl mb-2">
              Selamat Datang di RiHa
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Kami siap untuk melayani apa yang sangat dibutuhkan.
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="group">
              <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                >Email / Username</label
              >
              <input
                v-model="email"
                type="text"
                placeholder="Masukkan email/username"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div class="group">
              <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                >Password</label
              >
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-base lg:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <svg
                    v-if="showPassword"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
              <div class="flex justify-end mt-2">
                <RouterLink
                  to="/forgot-password"
                  class="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Lupa Password?
                </RouterLink>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3 bg-[#1d64f2] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transform transition-all duration-200 hover:scale-[1.02] text-sm tracking-wide"
            >
              Login
            </button>

            <div class="text-center pt-2">
              <p class="text-xs text-gray-500">
                Belum punya akun?
                <RouterLink
                  to="/register"
                  class="font-bold text-blue-600 hover:text-blue-800"
                  >Daftar sekarang</RouterLink
                >
              </p>
            </div>
          </form>

          <!-- <div class="mt-4 relative flex py-2 items-center">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink-0 mx-4 text-gray-500 text-xs"
              >Atau Login Dengan</span
            >
            <div class="flex-grow border-t border-gray-300"></div>
          </div>

          <div class="flex justify-center gap-4 mt-2 mb-8">
            <button
              class="bg-white border border-gray-300 p-2 rounded-full shadow-sm hover:bg-gray-50 transition transform hover:scale-110"
            >
              <svg class="h-6 w-6 fill-[#1877F2]" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </button>
            <button
              class="bg-white border border-gray-300 p-2 rounded-full shadow-sm hover:bg-gray-50 transition transform hover:scale-110"
            >
              <svg class="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EB4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}
</style>
