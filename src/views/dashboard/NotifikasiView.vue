<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router"; // Pastikan RouterLink diimport
import api from "../../services/api";
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";

const router = useRouter();
const isSidebarOpen = ref(false);
const currentUser = ref("Pengguna");

// --- STATE DATA ---
const notifikasiList = ref([]);
const loading = ref(true);

// 1. FUNGSI AMBIL DATA RUJUKAN (YANG BELUM DIPROSES)
const fetchNotifikasi = async () => {
  loading.value = true;
  try {
    // Mengambil data rujukan yang statusnya 'menunggu_pilihan_pasien'
    const response = await api.get("/referrals/pending");
    notifikasiList.value = response.data;
  } catch (error) {
    console.error("Gagal ambil notifikasi:", error);
  } finally {
    loading.value = false;
  }
};

// 2. FUNGSI PROSES RUJUKAN (TOMBOL PILIH RS)
const prosesRujukan = (item) => {
  // Arahkan ke halaman RS Terdekat
  // Bawa ID Rujukan & Spesialis agar otomatis terfilter di sana
  router.push({
    name: "rs-terdekat",
    query: {
      referralId: item._id,
      filterSpesialis: item.spesialisTujuan,
    },
  });
};

onMounted(() => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;

  const role = localStorage.getItem("role");
  // Logika role bisa ditambahkan disini jika perlu penyesuaian sidebar

  fetchNotifikasi();
});

// --- FUNGSI UI (SIDEBAR & LOGOUT) ---
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
const closeSidebar = () => {
  if (window.innerWidth < 1024) isSidebarOpen.value = false;
};
const handleLogout = () => {
  if (confirm("Apakah anda yakin ingin keluar?")) {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
          Notifikasi Rujukan
        </h2>

        <div
          v-if="loading"
          class="text-center py-10 text-gray-400 animate-pulse"
        >
          Sedang memuat notifikasi...
        </div>

        <div
          v-else-if="notifikasiList.length === 0"
          class="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <img
            src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg?w=740"
            alt="Kosong"
            class="w-40 opacity-50 mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900">
            Belum ada notifikasi
          </h3>
          <p class="text-gray-500 text-sm mt-1">
            Anda akan menerima pesan jika dokter memberikan rujukan.
          </p>
        </div>

        <div v-else class="space-y-4 max-w-4xl">
          <div
            v-for="item in notifikasiList"
            :key="item._id"
            class="bg-white border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                  >Tindakan Diperlukan</span
                >
                <span class="text-xs text-gray-400">
                  {{
                    new Date(item.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }}
                </span>
              </div>

              <h3 class="font-bold text-gray-800 text-lg">
                Surat Rujukan Medis Diterima
              </h3>

              <p class="text-gray-600 mt-2 text-sm leading-relaxed">
                Dokter telah merujuk Anda ke
                <span
                  class="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                  >{{ item.spesialisTujuan }}</span
                >. Silakan segera memilih Rumah Sakit rujukan yang tersedia.
              </p>

              <div
                v-if="item.catatan"
                class="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <p class="text-xs text-gray-500 font-medium">Catatan Dokter:</p>
                <p class="text-sm text-gray-700 italic">"{{ item.catatan }}"</p>
              </div>
            </div>

            <button
              @click="prosesRujukan(item)"
              class="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
            >
              Pilih Rumah Sakit
              <svg
                class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>
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
