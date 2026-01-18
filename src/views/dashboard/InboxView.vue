<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";

const router = useRouter();
const isSidebarOpen = ref(false);
const currentUser = ref("Pengguna");
const suratRujukan = ref([]);
const loading = ref(true);

// Fetch surat yang statusnya 'selesai'
const fetchSurat = async () => {
  try {
    const response = await api.get("/referrals/history");
    suratRujukan.value = response.data;
  } catch (error) {
    console.error("Gagal ambil surat:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;
  fetchSurat();
});

// Fungsi Cetak (Simulasi)
const printSurat = (item) => {
  alert(`🖨️ Mencetak Surat Rujukan ke ${item.rsTujuan}...`);
};

// Sidebar Logic
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
const closeSidebar = () => {
  if (window.innerWidth < 1024) isSidebarOpen.value = false;
};
const handleLogout = () => {
  if (confirm("Yakin keluar?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
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

      <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
        <h2
          class="text-2xl font-bold text-[#1d64f2] mb-6 flex items-center gap-2"
        >
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
          Surat Rujukan Saya
        </h2>

        <div v-if="loading" class="text-center py-10 text-gray-400">
          Sedang memuat surat...
        </div>

        <div
          v-else-if="suratRujukan.length === 0"
          class="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <img
            src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg?w=740"
            alt="Kosong"
            class="w-40 opacity-50 mb-4"
          />
          <p class="text-gray-500">Belum ada surat rujukan yang selesai.</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="item in suratRujukan"
            :key="item._id"
            class="bg-white p-0 rounded-xl shadow-lg border border-gray-200 overflow-hidden relative group"
          >
            <div
              class="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-center"
            >
              <div class="flex items-center gap-2">
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <span class="font-bold tracking-wider">SURAT RUJUKAN</span>
              </div>
              <span class="text-xs bg-white/20 px-2 py-1 rounded">RESMI</span>
            </div>

            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-xs text-gray-400 uppercase">Kepada Yth,</p>
                  <h3 class="font-bold text-gray-800 text-lg">
                    {{ item.rsTujuan }}
                  </h3>
                  <p class="text-sm text-blue-600 font-medium">
                    {{ item.dokterTujuan }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-400">Tanggal</p>
                  <p class="text-sm font-bold text-gray-700">
                    {{ new Date(item.tanggal).toLocaleDateString("id-ID") }}
                  </p>
                </div>
              </div>

              <div
                class="border-t border-b border-gray-100 py-4 my-4 space-y-2"
              >
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Poli Asal:</span>
                  <span class="text-sm font-semibold text-gray-700"
                    >Poli Umum</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Spesialis Tujuan:</span>
                  <span class="text-sm font-semibold text-gray-700">{{
                    item.spesialisTujuan
                  }}</span>
                </div>
                <div class="bg-yellow-50 p-3 rounded-lg mt-2">
                  <p class="text-xs text-gray-500 mb-1">Catatan Medis:</p>
                  <p class="text-sm text-gray-800 italic">
                    "{{ item.catatan }}"
                  </p>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button
                  @click="printSurat(item)"
                  class="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    ></path>
                  </svg>
                  Cetak / PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
