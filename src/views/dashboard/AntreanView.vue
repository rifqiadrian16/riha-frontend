<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../services/api";
import { showAlert, showConfirm } from "../../utils/alert"; // Import Helper
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";

import { io } from "socket.io-client";

const router = useRouter();
const isSidebarOpen = ref(false);
const currentUser = ref("Pengguna");
const userRole = ref("");

// --- STATE DATA ---
const riwayatAntrean = ref([]);
const recommendedRS = ref(null);
let socket = null;

// --- STATE FORM ---
const form = ref({
  poliTujuan: "",
  namaPasien: "",
  noHp: "",
  catatan: "",
});

// 1. FUNGSI AMBIL RIWAYAT ANTREAN
const fetchRiwayat = async () => {
  try {
    const response = await api.get("/queue");
    riwayatAntrean.value = response.data;
  } catch (error) {
    console.error("Gagal ambil riwayat:", error);
  }
};

// 2. FUNGSI AMBIL REKOMENDASI RS (PERBAIKAN DI SINI)
const fetchRujukan = async () => {
  try {
    // GANTI ENDPOINT: Dulu /referrals, sekarang /referrals/hospitals
    const response = await api.get("/referrals/hospitals");

    if (response.data.length > 0) {
      const rs = response.data[0];

      // MAPPING DATA: Sesuaikan format backend baru ke format yang diharapkan template
      recommendedRS.value = {
        namaRS: rs.nama,
        // Kita buat dummy poliTersedia karena backend sekarang cuma kirim array string poli
        poliTersedia: rs.poli.map((p) => ({
          namaPoli: p,
          dokter: "Tim Dokter Spesialis",
          hari: "Senin - Sabtu",
          jamPraktek: "08:00 - 20:00",
        })),
      };
    }
  } catch (error) {
    console.error("Gagal ambil rujukan:", error);
  }
};

onMounted(() => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;

  const role = localStorage.getItem("role");
  if (role) userRole.value = role;

  fetchRiwayat();
  fetchRujukan();

  const BACKEND_URL = "riha-backend-production.up.railway.app";
  const envUrl = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

  const socketUrl = envUrl.replace("/api", "");

  // Inisialisasi Socket dengan URL Dinamis
  socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  socket.on("queue_updated", (data) => {
    console.log("Real-time update:", data.msg);
    fetchRiwayat();
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});

// 3. FUNGSI DAFTAR ANTREAN
const handleSubmit = async () => {
  if (!form.value.poliTujuan) {
    showAlert(
      "Perhatian",
      "Harap pilih Poli Tujuan terlebih dahulu.",
      "warning",
    );
    return;
  }
  try {
    const response = await api.post("/queue", {
      poli: form.value.poliTujuan,
      namaPasien: form.value.namaPasien,
      noHp: form.value.noHp,
      catatan: form.value.catatan,
    });
    showAlert(
      "Pendaftaran Berhasil!",
      `Nomor Antrean Anda: ${response.data.nomorAntrean}`,
      "success",
    );
    form.value.poliTujuan = "";
    form.value.namaPasien = "";
    form.value.noHp = "";
    form.value.catatan = "";
  } catch (error) {
    console.error(error);
    showAlert(
      "Gagal Mendaftar",
      "Terjadi kesalahan sistem atau sesi habis.",
      "error",
    );
  }
};

// Helper Tampilan
const getStatusColor = (status) => {
  if (status === "selesai")
    return "bg-green-100 text-green-800 border-green-200";
  if (status === "dipanggil")
    return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
};

// Sidebar Logic
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
const closeSidebar = () => {
  if (window.innerWidth < 1024) isSidebarOpen.value = false;
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
        <div class="mb-6">
          <p class="text-gray-500 text-sm mb-1">
            Dashboard <span class="mx-2">></span> Daftar Antrean
          </p>
          <h2 class="text-2xl font-bold text-[#1d64f2]">Daftar Antrean</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div
            class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit"
          >
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label class="block text-[#1d64f2] font-bold mb-2"
                  >Poli Tujuan</label
                >
                <select
                  v-model="form.poliTujuan"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="" disabled>Pilih Poli Tujuan</option>
                  <option value="Poli Umum">Poli Umum</option>
                  <option value="Poli Gigi">Poli Gigi</option>
                  <option value="Poli Anak">Poli Anak</option>
                  <option value="Poli Penyakit Dalam">
                    Poli Penyakit Dalam
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[#1d64f2] font-bold mb-2"
                    >Nama Pasien</label
                  >
                  <input
                    v-model="form.namaPasien"
                    type="text"
                    placeholder="Nama pasien"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label class="block text-[#1d64f2] font-bold mb-2"
                    >No HP</label
                  >
                  <input
                    v-model="form.noHp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label class="block text-[#1d64f2] font-bold mb-2"
                  >Catatan</label
                >
                <textarea
                  v-model="form.catatan"
                  rows="4"
                  placeholder="Keluhan..."
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                ></textarea>
              </div>
              <div class="flex justify-end pt-2">
                <button
                  type="submit"
                  class="bg-[#1d64f2] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition transform hover:scale-[1.02]"
                >
                  Daftar
                </button>
              </div>
            </form>
          </div>

          <div class="space-y-6">
            <div
              class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 min-h-[200px]"
            >
              <h3
                class="text-[#1d64f2] font-bold mb-4 text-lg flex items-center gap-2"
              >
                Riwayat Antrean
              </h3>
              <div v-if="riwayatAntrean.length > 0" class="space-y-3">
                <div
                  v-for="(item, index) in riwayatAntrean"
                  :key="item._id || index"
                  class="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-blue-50 transition"
                >
                  <div>
                    <p class="font-bold text-gray-900 text-sm">
                      {{ item.poli }}
                    </p>
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border mt-1 inline-block"
                      :class="getStatusColor(item.status)"
                      >{{ item.status }}</span
                    >
                  </div>
                  <div
                    class="text-center bg-white border px-2 py-1 rounded shadow-sm"
                  >
                    <p class="text-[10px] text-gray-400">Nomor</p>
                    <p class="text-xl font-bold text-[#1d64f2]">
                      {{ item.nomorAntrean }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-400">
                <p class="text-sm">Belum ada antrean.</p>
              </div>
            </div>

            <div
              v-if="recommendedRS"
              class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div class="p-4 border-b border-gray-100">
                <h3 class="text-[#1d64f2] font-bold text-lg">
                  Rujukan Tersedia
                </h3>
              </div>
              <div class="h-32 bg-gray-200 w-full relative">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyhwgfKXWYFOCyIIzQkHxoWGYNJELOhDl90Q&s"
                  alt="RS"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="p-4 text-center">
                <h4 class="font-bold text-blue-800 text-sm mb-1">
                  {{ recommendedRS.namaRS }}
                </h4>
                <p
                  v-if="recommendedRS.poliTersedia.length > 0"
                  class="text-xs text-gray-600 font-medium"
                >
                  {{ recommendedRS.poliTersedia[0].dokter }} -
                  {{ recommendedRS.poliTersedia[0].namaPoli }}
                </p>
                <div class="flex gap-2 justify-center mt-4">
                  <RouterLink
                    to="/rs-terdekat"
                    class="bg-[#16a34a] text-white text-xs font-bold px-6 py-1.5 rounded-full hover:bg-green-700 transition"
                    >Lihat Semua</RouterLink
                  >
                </div>
              </div>
            </div>
            <div
              v-else
              class="bg-white rounded-xl p-4 text-center text-gray-400 text-sm border border-dashed"
            >
              Data rujukan belum tersedia.
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
