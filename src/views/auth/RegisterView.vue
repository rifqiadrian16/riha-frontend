<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import api from "../../services/api";
import { showAlert } from "../../utils/alert";

const router = useRouter();
const isSubmitting = ref(false);

// State input
const fullName = ref("");
const username = ref("");
const email = ref("");
const birthDate = ref(null);
const password = ref("");
const confirmPassword = ref("");
// Field lain seperti firstName/username kita gabung/abaikan dulu sesuai backend sederhana kita
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreement = ref(false);
const isLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});

const handleRegister = async () => {
  if (
    !fullName.value ||
    !username.value ||
    !email.value ||
    !birthDate.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    showAlert(
      "Data Kurang",
      "Mohon lengkapi semua kolom pendaftaran.",
      "warning",
    );
    return;
  }

  if (!agreement.value) {
    // alert("Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.");
    showAlert(
      "Gagal Daftar",
      "Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.",
      "error",
    );
    return;
  }

  if (password.value !== confirmPassword.value) {
    // alert("Password dan Konfirmasi Password tidak sama!");
    showAlert(
      "Gagal Daftar",
      "Password dan Konfirmasi Password tidak sama!",
      "error",
    );
    return;
  }

  isSubmitting.value = true;
  try {
    // Panggil API Register
    await api.post("/auth/register", {
      nama: fullName.value,
      username: username.value,
      email: email.value,
      tanggalLahir: birthDate.value,
      password: password.value,
      role: "pasien", // Default role
    });

    // alert("Registrasi Berhasil! Silakan Login.");

    await showAlert(
      "Registrasi Berhasil",
      "Silakan cek inbox/spam email Anda untuk mengaktifkan akun.",
      "success",
    );
    router.push("/login"); // Arahkan ke halaman login
  } catch (error) {
    console.error(error);
    const pesan = error.response?.data?.msg || "Registrasi Gagal.";
    showAlert("Gagal Daftar", pesan, "error");
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
        class="flex-1 overflow-y-auto px-6 pt-6 lg:pt-8 pb-20 flex flex-col items-center transition-all duration-700 ease-out scroll-smooth"
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

        <div class="w-full max-w-md">
          <div class="text-center mb-6">
            <h3 class="text-blue-800 font-bold text-xl mb-1">
              Selamat Datang di RiHa
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              kami siap untuk melayani apa yang sangat dibutuhkan
            </p>
          </div>

          <div
            class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <form @submit.prevent="handleRegister" class="space-y-3">
              <div class="group">
                <input
                  v-model="fullName"
                  type="text"
                  placeholder="Nama Lengkap"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-base lg:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>

              <div class="group">
                <input
                  v-model="username"
                  @input="username = username.replace(/\s/g, '')"
                  type="text"
                  placeholder="Username"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>

              <div class="group">
                <input
                  v-model="email"
                  type="email"
                  placeholder="Email"
                  autocomplete="email"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-base lg:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
              <div class="group">
                <input
                  type="date"
                  placeholder="Tanggal Lahir"
                  v-model="birthDate"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-base lg:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>

              <div class="group relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-base lg:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm pr-10"
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

              <div class="group relative">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm Password"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-base lg:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm pr-10"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 cursor-pointer"
                >
                  <svg
                    v-if="showConfirmPassword"
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

              <div class="flex items-start pt-2">
                <div class="flex items-center h-5">
                  <input
                    id="agreement"
                    v-model="agreement"
                    type="checkbox"
                    class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 text-blue-600 cursor-pointer"
                  />
                </div>
                <label
                  for="agreement"
                  class="ml-2 text-[11px] text-gray-500 cursor-pointer select-none"
                >
                  Dengan mendaftar, anda setuju dengan
                  <span class="text-blue-500 hover:underline"
                    >ketentuan layanan</span
                  >
                  dan
                  <span class="text-blue-500 hover:underline"
                    >kebijakan privasi</span
                  >
                </label>
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full py-3 bg-[#1d64f2] hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex justify-center items-center gap-2"
                >
                  <svg
                    v-if="isSubmitting"
                    class="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>

                  <span>{{
                    isSubmitting ? "Sedang Memproses..." : "Daftar Sekarang"
                  }}</span>
                </button>
              </div>
            </form>
          </div>

          <div class="mt-4 text-center pb-8">
            <p class="text-xs text-gray-500">
              Sudah punya akun?
              <RouterLink
                to="/login"
                class="font-bold text-blue-600 hover:text-blue-800"
                >Login Sekarang</RouterLink
              >
            </p>
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
