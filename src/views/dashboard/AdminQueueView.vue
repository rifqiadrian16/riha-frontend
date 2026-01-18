<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../../services/api";
import { showAlert, showConfirm } from "../../utils/alert";

const router = useRouter();
const isSidebarOpen = ref(false); // State untuk mobile menu
const currentUser = ref("Admin");

// --- STATE NAVIGASI TAB ---
const activeTab = ref("antrean"); // 'antrean' atau 'rujukan'

// --- STATE DATA ---
const antreanList = ref([]);
const referralList = ref([]);
const loading = ref(false);
const filterPoli = ref("");
const searchQuery = ref("");
let pollingInterval = null;

// --- STATE MODAL RUJUKAN ---
const showModal = ref(false);
const selectedQueue = ref(null);
const isSubmitting = ref(false);

const referralForm = ref({
  spesialis: "",
  catatan: "",
});

const specialistOptions = [
  "Penyakit Dalam",
  "Mata",
  "Anak",
  "Bedah",
  "Gigi",
  "Jantung",
  "THT",
  "Syaraf",
  "Kandungan (Obgyn)",
  "Kulit & Kelamin",
  "Paru",
  "Orthopedi",
  "Rehabilitasi Medik",
];

const showSuggestions = ref(false);

// Filter Autocomplete Spesialis
const filteredSpecialists = computed(() => {
  if (!referralForm.value.spesialis) return specialistOptions;
  const query = referralForm.value.spesialis.toLowerCase();
  return specialistOptions.filter((item) => item.toLowerCase().includes(query));
});

// Filter Tabel Antrean
const filteredAntrean = computed(() => {
  return antreanList.value.filter((q) => {
    // Filter Poli
    const matchPoli = !filterPoli.value || q.poli === filterPoli.value;

    // Filter Search (Nomor Antrean atau Nama Pasien)
    const query = searchQuery.value.toLowerCase();
    const matchSearch =
      !searchQuery.value ||
      (q.nomorAntrean &&
        q.nomorAntrean.toString().toLowerCase().includes(query)) ||
      (q.namaPasien && q.namaPasien.toLowerCase().includes(query));

    return matchPoli && matchSearch;
  });
});

// --- API FETCH ACTIONS ---

// 1. Ambil Data Antrean
const fetchAllQueues = async () => {
  try {
    const response = await api.get("/queue/all");
    antreanList.value = response.data;
  } catch (error) {
    console.error("Gagal ambil antrean:", error);
  }
};

// 2. Ambil Data Rujukan (Admin)
const fetchReferrals = async () => {
  try {
    const response = await api.get("/referrals");
    referralList.value = response.data;
  } catch (error) {
    console.error("Gagal ambil rujukan:", error);
  }
};

const refreshData = () => {
  if (activeTab.value === "antrean") fetchAllQueues();
  else fetchReferrals();
};

// --- API UPDATE ACTIONS ---

const updateStatus = async (id, newStatus) => {
  try {
    await api.put(`/queue/${id}/status`, { status: newStatus });
    fetchAllQueues();
    if (newStatus === "dipanggil") playNotificationSound();
  } catch (error) {
    console.error("Gagal update status:", error);
  }
};

const confirmReferral = async () => {
  if (!referralForm.value.spesialis) {
    showAlert("Data Kurang", "Harap isi tujuan spesialis", "warning");
    return;
  }
  if (!specialistOptions.includes(referralForm.value.spesialis)) {
    showAlert("Data Invalid", "Pilih spesialis dari daftar.", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    await api.post("/referrals/initiate", {
      pasienId: selectedQueue.value.user,
      namaPasien: selectedQueue.value.namaPasien,
      spesialis: referralForm.value.spesialis,
      catatan: referralForm.value.catatan || "",
    });

    await updateStatus(selectedQueue.value._id, "selesai");
    showAlert("Berhasil", "Surat rujukan berhasil dibuat.", "success");
    closeModal();
    refreshData();
  } catch (error) {
    showAlert("Gagal", "Terjadi kesalahan sistem.", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const printReferral = (item) => {
  const namaPasien = item.pasien?.nama || "Pasien";
  showAlert("Cetak", `Mencetak rujukan untuk ${namaPasien}...`, "info");
};

// --- HELPER FUNCTIONS ---

const openReferralModal = (queue) => {
  selectedQueue.value = queue;
  referralForm.value.spesialis = "";
  referralForm.value.catatan = "";
  showModal.value = true;
  showSuggestions.value = false;
};

const closeModal = () => {
  showModal.value = false;
  selectedQueue.value = null;
};

const selectSpecialist = (name) => {
  referralForm.value.spesialis = name;
  showSuggestions.value = false;
};

const playNotificationSound = () => {
  new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
    .play()
    .catch(() => {});
};

const getStatusBadge = (status) => {
  switch (status) {
    case "menunggu":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "dipanggil":
      return "bg-green-100 text-green-800 border-green-200 animate-pulse";
    case "selesai":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "dilewati":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100";
  }
};

// Toggle Sidebar Mobile
const toggleSidebar = () => (isSidebarOpen.value = !isSidebarOpen.value);
const closeSidebarMobile = () => {
  if (window.innerWidth < 1024) isSidebarOpen.value = false;
};

const handleLogout = async () => {
  const isConfirmed = await showConfirm(
    "Keluar Akun?",
    "Anda harus login ulang untuk mengakses dashboard.",
  );
  if (isConfirmed) {
    localStorage.clear(); // Hapus semua data sesi
    router.push("/");
    showAlert("Berhasil Keluar", "Sampai jumpa!", "success");
  }
};

const handleBlur = () => {
  // Beri jeda sedikit agar klik pada item list sempat terdeteksi sebelum list hilang
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handleResetToday = async () => {
  const isConfirmed = await showConfirm(
    "Reset Antrean Hari Ini?",
    "Semua data antrean hari ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan!",
    "warning",
  );

  if (isConfirmed) {
    try {
      await api.delete("/queue/reset");
      await showAlert(
        "Berhasil",
        "Semua antrean hari ini telah dibersihkan.",
        "success",
      );
      fetchAllQueues(); // Refresh data manual
    } catch (error) {
      console.error(error);
      showAlert("Gagal", "Terjadi kesalahan saat mereset antrean.", "error");
    }
  }
};

// Watcher
watch(activeTab, () => {
  loading.value = true;
  refreshData();
  setTimeout(() => (loading.value = false), 500);
});

// Lifecycle
onMounted(() => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;

  loading.value = true;
  refreshData();
  loading.value = false;

  pollingInterval = setInterval(refreshData, 5000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div
          class="bg-[#1d64f2] p-4 flex justify-between items-center text-white"
        >
          <h3 class="font-bold flex items-center gap-2">Buat Surat Rujukan</h3>
          <button
            @click="closeModal"
            class="text-white/70 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p class="text-xs text-gray-500 font-bold uppercase">Pasien</p>
            <p class="text-lg font-bold text-gray-800">
              {{ selectedQueue?.nomorAntrean }}
            </p>
            <p class="text-sm text-gray-700 font-semibold">
              {{ selectedQueue?.namaPasien }}
            </p>
            <p class="text-xs text-gray-600">
              Poli Asal: {{ selectedQueue?.poli }}
            </p>
          </div>
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tujuan Spesialis</label
            >
            <input
              type="text"
              v-model="referralForm.spesialis"
              @focus="showSuggestions = true"
              @blur="handleBlur"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cari spesialis..."
            />
            <ul
              v-if="showSuggestions"
              class="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
            >
              <li
                v-for="opt in filteredSpecialists"
                :key="opt"
                @click="selectSpecialist(opt)"
                class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              >
                {{ opt }}
              </li>
            </ul>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Catatan</label
            >
            <textarea
              v-model="referralForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>
        </div>
        <div class="p-4 bg-gray-50 flex justify-end gap-3 border-t">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            @click="confirmReferral"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-[#1d64f2] hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition disabled:opacity-50"
          >
            {{ isSubmitting ? "Memproses..." : "Kirim" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
    ></div>

    <aside
      class="fixed lg:static inset-y-0 left-0 w-64 bg-[#1e293b] text-white flex flex-col shadow-2xl z-30 transform transition-transform duration-300"
      :class="
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      "
    >
      <div
        class="h-20 flex items-center justify-center border-b border-gray-700"
      >
        <h1 class="text-xl font-bold tracking-wider">ADMIN PANEL</h1>
      </div>

      <nav class="flex-1 py-6 px-3 space-y-2">
        <div
          class="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium flex items-center gap-3 cursor-pointer"
          @click="
            activeTab = 'antrean';
            closeSidebarMobile();
          "
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          Dashboard Admin
        </div>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Keluar
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <header
        class="bg-white h-16 border-b flex items-center justify-between px-6 shadow-sm"
      >
        <button @click="toggleSidebar" class="lg:hidden text-gray-500">
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
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-gray-700">Manajemen Pasien</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-600">Admin Petugas</span>
          <div
            class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            A
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <div class="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 w-fit">
          <button
            @click="activeTab = 'antrean'"
            class="w-32 rounded-lg py-2.5 text-sm font-medium leading-5 transition shadow"
            :class="
              activeTab === 'antrean'
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
            "
          >
            Antrean Aktif
          </button>
          <button
            @click="activeTab = 'rujukan'"
            class="w-32 rounded-lg py-2.5 text-sm font-medium leading-5 transition"
            :class="
              activeTab === 'rujukan'
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.5] hover:text-gray-800'
            "
          >
            Data Rujukan
          </button>
        </div>

        <div v-if="activeTab === 'antrean'">
          <div
            class="mb-4 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4"
          >
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari Nama / No..."
                class="border-gray-300 border rounded-lg text-sm px-3 py-2 w-full"
              />
              <select
                v-model="filterPoli"
                class="border rounded-lg text-sm px-3 py-2 w-full sm:w-auto"
              >
                <option value="">Semua Poli</option>
                <option value="Poli Umum">Poli Umum</option>
                <option value="Poli Gigi">Poli Gigi</option>
                <option value="Poli Anak">Poli Anak</option>
                <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
              </select>
            </div>

            <div class="flex">
              <button
                @click="handleResetToday"
                class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-bold transition flex items-center gap-2 mx-4"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
                Reset Hari Ini
              </button>
              <button
                @click="fetchAllQueues"
                class="text-blue-600 font-medium text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead
                  class="bg-gray-50 text-gray-700 font-bold uppercase text-xs"
                >
                  <tr>
                    <th class="px-6 py-4">No. Antrean</th>
                    <th class="px-6 py-4">Nama Pasien</th>
                    <th class="px-6 py-4">Poli</th>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4">Waktu</th>
                    <th class="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="loading">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                      Memuat data...
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="queue in filteredAntrean"
                    :key="queue._id"
                    class="hover:bg-gray-50 transition"
                  >
                    <td class="px-6 py-4 font-bold text-lg text-blue-600">
                      {{ queue.nomorAntrean }}
                    </td>
                    <td class="px-6 py-4 font-bold text-gray-800">
                      {{ queue.namaPasien }}
                    </td>
                    <td class="px-6 py-4 font-medium">{{ queue.poli }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-bold border"
                        :class="getStatusBadge(queue.status)"
                        >{{ queue.status }}</span
                      >
                    </td>
                    <td class="px-6 py-4 text-xs">
                      {{
                        new Date(queue.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex justify-center gap-2">
                        <button
                          v-if="queue.status === 'menunggu'"
                          @click="updateStatus(queue._id, 'dipanggil')"
                          class="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                        >
                          Panggil
                        </button>
                        <button
                          v-if="queue.status === 'dipanggil'"
                          @click="updateStatus(queue._id, 'selesai')"
                          class="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                        >
                          Selesai
                        </button>
                        <button
                          v-if="queue.status === 'dipanggil'"
                          @click="openReferralModal(queue)"
                          class="bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                        >
                          Rujuk
                        </button>
                        <button
                          v-if="queue.status === 'dipanggil'"
                          @click="updateStatus(queue._id, 'dilewati')"
                          class="bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-bold"
                        >
                          Lewati
                        </button>
                        <button
                          v-if="queue.status === 'dilewati'"
                          @click="updateStatus(queue._id, 'dipanggil')"
                          class="bg-gray-500 text-white px-3 py-1.5 rounded text-xs font-bold"
                        >
                          Panggil Lagi
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'rujukan'">
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead
                  class="bg-gray-50 text-gray-700 font-bold uppercase text-xs"
                >
                  <tr>
                    <th class="px-6 py-4">Tanggal</th>
                    <th class="px-6 py-4">Nama Pasien</th>
                    <th class="px-6 py-4">Tujuan Spesialis</th>
                    <th class="px-6 py-4">RS Pilihan</th>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="loading">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                      Memuat rujukan...
                    </td>
                  </tr>
                  <tr v-else-if="referralList.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                      Belum ada rujukan.
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="ref in referralList"
                    :key="ref._id"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-6 py-4 font-medium">
                      {{ new Date(ref.tanggal).toLocaleDateString("id-ID") }}
                    </td>

                    <td class="px-6 py-4 font-bold text-gray-800">
                      {{ ref.namaPasien || ref.pasien?.nama }}
                    </td>

                    <td class="px-6 py-4 text-blue-600 font-medium">
                      {{ ref.spesialisTujuan }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        v-if="ref.rsTujuan"
                        class="font-bold text-gray-700"
                        >{{ ref.rsTujuan }}</span
                      >
                      <span v-else class="text-xs text-gray-400 italic"
                        >Belum dipilih</span
                      >
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-bold border"
                        :class="
                          ref.status === 'selesai'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        "
                        >{{
                          ref.status === "selesai" ? "Terbit" : "Menunggu"
                        }}</span
                      >
                    </td>
                    <td class="px-6 py-4 text-center">
                      <button
                        @click="printReferral(ref)"
                        class="text-gray-500 hover:text-blue-600"
                      >
                        <svg
                          class="w-5 h-5"
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
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
