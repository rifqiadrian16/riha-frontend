<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router"; // Pastikan RouterLink diimport
import api from "../../services/api";
import { showAlert } from "../../utils/alert";

const router = useRouter();
const email = ref("");
const isSubmitting = ref(false);
const isLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});

const handleForgot = async () => {
  if (!email.value) {
    showAlert("Data Kurang", "Mohon masukkan email Anda.", "warning");
    return;
  }

  isSubmitting.value = true;
  try {
    await api.post("/auth/forgot-password", { email: email.value });
    await showAlert(
      "Terkirim",
      "Cek email Anda untuk link reset password.",
      "success",
    );
    email.value = ""; // Reset form
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.msg || "Gagal mengirim email.";
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
            <h3 class="text-blue-800 font-bold text-xl mb-2">Lupa Password?</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Masukkan email terdaftar Anda untuk menerima link reset password.
            </p>
          </div>

          <div
            class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <form @submit.prevent="handleForgot" class="space-y-4">
              <div class="group">
                <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                  >Email Terdaftar</label
                >
                <input
                  v-model="email"
                  type="email"
                  placeholder="contoh@email.com"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full py-3 bg-[#1d64f2] hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? "Mengirim..." : "Kirim Link Reset" }}
                </button>
              </div>
            </form>
          </div>

          <div class="mt-6 text-center text-sm">
            <RouterLink
              to="/login"
              class="font-bold text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
            >
              <span>&larr;</span> Kembali ke Login
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
