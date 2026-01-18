<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import api from "../../services/api";
import { showAlert } from "../../utils/alert";

const route = useRoute();
const router = useRouter();

const newPassword = ref("");
const confirmPassword = ref("");
const token = ref("");
const isSubmitting = ref(false);
const showPassword = ref(false);
const isLoaded = ref(false);

onMounted(() => {
  // Efek Loading Halus
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);

  // Ambil token dari URL
  token.value = route.query.token;
  if (!token.value) {
    showAlert("Error", "Token tidak ditemukan atau tidak valid.", "error");
    router.push("/forgot-password");
  }
});

const handleReset = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    return showAlert(
      "Data Kurang",
      "Mohon isi password baru dan konfirmasi.",
      "warning",
    );
  }
  if (newPassword.value !== confirmPassword.value) {
    return showAlert(
      "Password Salah",
      "Password dan konfirmasi tidak cocok.",
      "error",
    );
  }

  isSubmitting.value = true;
  try {
    await api.post("/auth/reset-password", {
      token: token.value,
      newPassword: newPassword.value,
    });

    await showAlert(
      "Sukses",
      "Password berhasil diubah! Silakan login kembali.",
      "success",
    );
    router.push("/login");
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.msg || "Gagal mereset password.";
    showAlert("Gagal", msg, "error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="flex w-full bg-white h-screen overflow-hidden font-sans">
    <div class="hidden lg:block lg:w-2/3 relative h-full group bg-gray-200">
      <img
        src="/images/bg-ilustrasi.png"
        alt="Background"
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
      class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full shadow-2xl z-30 relative"
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
        class="flex-1 overflow-y-auto px-6 pt-6 lg:pt-12 pb-20 flex flex-col items-center transition-all duration-700 ease-out scroll-smooth"
        :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      >
        <div
          class="lg:hidden mb-6 bg-white p-1 rounded-full shadow-lg ring-1 ring-gray-100 overflow-hidden h-20 w-20 shrink-0"
        >
          <img
            src="/images/logo-riha.jpg"
            alt="Logo"
            class="h-full w-full object-cover rounded-full"
          />
        </div>

        <div class="w-full max-w-sm">
          <div class="text-center mb-8">
            <h3 class="text-blue-800 font-bold text-xl mb-2">Reset Password</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Silakan buat password baru untuk akun Anda.
            </p>
          </div>

          <div
            class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <form @submit.prevent="handleReset" class="space-y-4">
              <div class="group relative">
                <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                  >Password Baru</label
                >
                <div class="relative">
                  <input
                    v-model="newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="******"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm pr-10"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 cursor-pointer"
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
              </div>

              <div class="group">
                <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                  >Konfirmasi Password</label
                >
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="******"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full py-3 bg-[#1d64f2] hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? "Memproses..." : "Ubah Password" }}
                </button>
              </div>
            </form>
          </div>

          <div class="mt-6 text-center text-sm">
            <RouterLink
              to="/"
              class="font-bold text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
            >
              <span>&larr;</span> Batal
            </RouterLink>
          </div>
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
