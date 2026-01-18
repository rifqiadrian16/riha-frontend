<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import api from "../../services/api"; // Import API
import { showAlert, showToast, showConfirm } from "../../utils/alert";
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";

const router = useRouter();
const isSidebarOpen = ref(false);
const currentUser = ref("Pengguna");

// STATE FORM PENGATURAN (REALTIME)
const profile = ref({
  nama: "",
  email: "",
  noHp: "",
});

const notifications = ref({
  email: true,
  sms: true,
  app: true,
});

// 1. FUNGSI AMBIL PROFIL USER
const fetchProfile = async () => {
  try {
    // Asumsi endpoint backend untuk get profile
    const response = await api.get("/auth/profile");
    const data = response.data;

    // Isi form dengan data dari database
    profile.value = {
      nama: data.nama,
      email: data.email,
      noHp: data.noHp || "", // Handle jika kosong
    };
    currentUser.value = data.nama;
  } catch (error) {
    console.error("Gagal ambil profil:", error);
    // Fallback ke localstorage jika API gagal
    profile.value.nama = localStorage.getItem("username") || "User";
  }
};

onMounted(() => {
  fetchProfile(); // Ambil data saat halaman dibuka
});

// 2. FUNGSI UPDATE PROFIL
const saveSettings = async () => {
  if (!profile.value.nama) {
    showAlert("Validasi Gagal", "Nama tidak boleh kosong!", "warning");
    return;
  }

  try {
    // Kirim update ke backend
    await api.put("/auth/profile", {
      nama: profile.value.nama,
      email: profile.value.email,
      noHp: profile.value.noHp,
    });

    // Update tampilan
    localStorage.setItem("username", profile.value.nama);
    currentUser.value = profile.value.nama;
    showToast("Profil berhasil diperbarui", "success");
  } catch (error) {
    console.error(error);
    showAlert(
      "Gagal Menyimpan",
      "Terjadi kesalahan saat update data.",
      "error",
    );
  }
};

// ... (Sisa fungsi Sidebar & Logout) ...
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
const closeSidebar = () => {
  if (window.innerWidth < 1024) isSidebarOpen.value = false;
};
const handleLogout = async () => {
  const yes = await showConfirm("Keluar?", "Anda yakin ingin keluar?");
  if (yes) {
    localStorage.clear();
    router.push("/");
  }
};
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
    ></div>

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <Header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <h2 class="text-2xl font-bold text-[#1d64f2] mb-6">Pengaturan</h2>

        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 max-w-4xl"
        >
          <h3
            class="text-[#1d64f2] font-bold text-lg mb-6 border-b border-gray-100 pb-2"
          >
            Profil Pengguna
          </h3>

          <div class="flex flex-col md:flex-row gap-8 items-start">
            <div class="flex-shrink-0">
              <div
                class="h-24 w-24 bg-slate-300 rounded-full flex items-center justify-center text-white overflow-hidden shadow-inner"
              >
                <svg class="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            <div class="flex-1 w-full space-y-4">
              <div>
                <label class="block text-gray-700 font-bold mb-2">Nama</label>
                <input
                  v-model="profile.nama"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 font-bold mb-2"
                    >Email</label
                  >
                  <input
                    v-model="profile.email"
                    type="email"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-bold mb-2"
                    >No HP</label
                  >
                  <input
                    v-model="profile.noHp"
                    type="tel"
                    placeholder="08xxx"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div class="flex justify-end mt-4">
                <button
                  @click="saveSettings"
                  class="bg-[#1d64f2] hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition transform hover:scale-[1.02]"
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl"
        >
          <h3
            class="text-[#1d64f2] font-bold text-lg mb-4 border-b border-gray-100 pb-2"
          >
            Pengaturan Notifikasi
          </h3>
          <div class="space-y-4">
            <label
              class="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition"
            >
              <input
                v-model="notifications.email"
                type="checkbox"
                class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span class="text-gray-700 font-medium">Email</span>
            </label>
            <hr class="border-gray-100" />
            <label
              class="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition"
            >
              <input
                v-model="notifications.sms"
                type="checkbox"
                class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span class="text-gray-700 font-medium">SMS</span>
            </label>
            <hr class="border-gray-100" />
            <label
              class="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition"
            >
              <input
                v-model="notifications.app"
                type="checkbox"
                class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span class="text-gray-700 font-medium"
                >Notifikasi di Aplikasi</span
              >
            </label>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
