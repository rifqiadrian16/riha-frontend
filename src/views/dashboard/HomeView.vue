<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import api from "../../services/api";
import { showAlert, showConfirm } from "../../utils/alert";
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";

const router = useRouter();

// 1. STATE USER & SIDEBAR
const isSidebarOpen = ref(false);
const currentUser = ref("Pengguna");

// 2. STATE DATA REALTIME
const notifications = ref([]);
const inboxMessages = ref([]);
const referralRS = ref(null); // Akan menyimpan RS terdekat
const myQueue = ref(null);
let pollingInterval = null;
const unreadCount = ref(0);
const userLocation = ref(null); // [BARU] Simpan lokasi user

// 3. STATE FORM
const form = ref({
  poliTujuan: "",
  namaPasien: "",
  noHp: "",
  catatan: "",
});

const checkUnread = async () => {
  try {
    const response = await api.get("/referrals/pending");
    unreadCount.value = response.data.length;
  } catch (error) {
    // silent error
  }
};

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

// [BARU] Fungsi Ambil Lokasi GPS
const getUserLocation = () => {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve();
        },
        (error) => {
          console.log("GPS tidak aktif/ditolak");
          resolve(); // Lanjut tanpa lokasi
        },
      );
    } else {
      resolve();
    }
  });
};

// [BARU] Rumus Hitung Jarak (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// 4. FUNGSI AMBIL DATA (FETCH)
const fetchData = async () => {
  try {
    // A. Notifikasi
    const resNotif = await api.get("/referrals/pending");
    notifications.value = resNotif.data
      .map((item) => ({
        title: "Rujukan Masuk: " + item.spesialisTujuan,
        date: item.tanggal,
      }))
      .slice(0, 1);

    // B. Inbox
    try {
      const resInbox = await api.get("/referrals/history");
      inboxMessages.value = resInbox.data
        .map((item) => ({
          sender: item.rsTujuan || "RS Rujukan",
          title: "Surat Rujukan Poli " + item.spesialisTujuan,
        }))
        .slice(0, 1);
    } catch (e) {}

    // C. RS RUJUKAN (UPDATE LOGIC: Cari yang Terdekat)
    const resRef = await api.get("/referrals/hospitals");
    let hospitals = resRef.data;

    // Jika lokasi user tersedia, hitung jarak dan urutkan
    if (userLocation.value) {
      hospitals = hospitals.map((rs) => ({
        ...rs,
        distance: calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          rs.lat,
          rs.lng,
        ),
      }));
      // Urutkan dari yang distance-nya terkecil
      hospitals.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    if (hospitals.length > 0) {
      const rs = hospitals[0]; // Ambil yang paling atas (terdekat)
      referralRS.value = {
        namaRS: rs.nama,
        image: rs.image,
        distance: rs.distance, // [BARU] Simpan jarak
        poliTersedia: [{ dokter: "Tim Dokter Spesialis" }],
      };
    }

    // D. Antrean Saya
    const resQueue = await api.get("/queue");
    const activeQ = resQueue.data.find((q) => q.status !== "selesai");
    if (activeQ) myQueue.value = activeQ;
  } catch (error) {
    console.error("Gagal memuat dashboard");
  }
};

onMounted(async () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;

  await getUserLocation(); // [BARU] Tunggu lokasi dulu
  fetchData();
  checkUnread();

  pollingInterval = setInterval(() => {
    fetchData();
    checkUnread();
  }, 5000); // Ubah jadi 5 detik biar ga terlalu berat
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});

// 5. LOGIC DAFTAR ANTREAN
const handleDaftarAntrean = async () => {
  if (!form.value.poliTujuan) {
    showAlert("Data Belum Lengkap", "Silakan pilih Poli Tujuan.", "warning");
    return;
  }
  try {
    const response = await api.post("/queue", {
      poli: form.value.poliTujuan,
      namaPasien: currentUser.value,
      noHp: form.value.noHp,
      catatan: form.value.catatan,
    });
    showAlert(
      "Berhasil!",
      `Nomor Antrean: ${response.data.nomorAntrean}`,
      "success",
    );
    fetchData();
    form.value = { poliTujuan: "", namaPasien: "", noHp: "", catatan: "" };
  } catch (error) {
    showAlert("Gagal", "Tidak dapat mengambil antrean saat ini.", "error");
  }
};

// UI Helper
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

      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            class="lg:col-span-2 bg-green-100 rounded-2xl p-6 flex justify-between items-center shadow-sm relative overflow-hidden"
          >
            <div class="z-10 relative">
              <h2
                class="text-xl lg:text-2xl font-bold text-[#1d64f2] mb-1 uppercase"
              >
                SELAMAT DATANG, {{ currentUser }}!
              </h2>
              <p class="text-gray-600 mb-4 max-w-sm">
                Pendaftaran Antrean dan Rujukan Kesehatan Terintegrasi
              </p>
              <div class="flex gap-3">
                <RouterLink
                  to="/antrean"
                  class="bg-[#1d64f2] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition"
                  >Daftar Antrean</RouterLink
                >
                <RouterLink
                  to="/rs-terdekat"
                  class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition"
                  >Cek Rujukan</RouterLink
                >
              </div>
            </div>
            <div class="bg-white p-2 rounded-xl shadow-md hidden sm:block">
              <img
                src="/images/logo-riha.jpg"
                alt="Logo"
                class="h-20 w-20 object-contain"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div
              class="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-[#1d64f2] font-bold">Notifikasi Terbaru</h3>
                <RouterLink
                  to="/notifikasi"
                  class="text-xs text-blue-500 hover:underline"
                  >Lihat Semua</RouterLink
                >
              </div>
              <div
                v-if="notifications.length > 0"
                class="flex items-center gap-3"
              >
                <div class="bg-gray-100 p-2 rounded-full">
                  <svg
                    class="w-6 h-6 text-gray-700"
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
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900 line-clamp-1">
                    {{ notifications[0].title }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(notifications[0].date).toLocaleDateString() }}
                  </p>
                </div>
              </div>
              <div v-else class="text-xs text-gray-400 py-2 text-center">
                Tidak ada notifikasi baru
              </div>
            </div>

            <div
              class="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-[#1d64f2] font-bold">Inbox Terbaru</h3>
                <RouterLink
                  to="/inbox"
                  class="text-xs text-blue-500 hover:underline"
                  >Lihat Semua</RouterLink
                >
              </div>
              <div
                v-if="inboxMessages.length > 0"
                class="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs"
                  >
                    {{ inboxMessages[0].sender.charAt(0) }}
                  </div>
                  <span class="text-sm text-gray-600 line-clamp-1">{{
                    inboxMessages[0].title
                  }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-gray-400 py-2 text-center">
                Inbox kosong
              </div>
            </div>
          </div>

          <div
            class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit"
          >
            <h3 class="text-[#1d64f2] font-bold text-lg text-center mb-4">
              Ambil Antrean Cepat
            </h3>
            <form @submit.prevent="handleDaftarAntrean" class="space-y-3">
              <input
                v-model="currentUser"
                type="text"
                readonly
                class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <div class="grid grid-cols-2 gap-3">
                <select
                  v-model="form.poliTujuan"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="" disabled>Pilih Poli</option>
                  <option value="Poli Umum">Poli Umum</option>
                  <option value="Poli Gigi">Poli Gigi</option>
                  <option value="Poli Anak">Poli Anak</option>
                  <option value="Poli Penyakit Dalam">
                    Poli Penyakit Dalam
                  </option>
                </select>
                <input
                  v-model="form.noHp"
                  type="tel"
                  placeholder="No.HP"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-[#1d64f2] hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition transform hover:scale-[1.02]"
              >
                Daftar Sekarang
              </button>
            </form>
          </div>

          <div class="space-y-6">
            <div
              class="bg-green-200 rounded-2xl p-6 text-center flex flex-col justify-center items-center shadow-sm h-64"
            >
              <h3 class="text-[#1d64f2] font-bold mb-2">Status Antrean Anda</h3>
              <div v-if="myQueue">
                <div class="bg-white px-8 py-4 rounded-xl shadow-sm mb-2">
                  <span class="text-4xl font-extrabold text-[#1d64f2]">{{
                    myQueue.nomorAntrean
                  }}</span>
                </div>
                <p class="text-gray-800 font-bold mb-1">{{ myQueue.poli }}</p>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  :class="
                    myQueue.status === 'dipanggil'
                      ? 'bg-blue-500 text-white'
                      : 'bg-yellow-400 text-yellow-900'
                  "
                  >{{ myQueue.status }}</span
                >
              </div>
              <div v-else class="opacity-50">
                <p class="text-gray-600">Anda sedang tidak mengantre.</p>
                <p class="text-xs mt-2">Silakan daftar di form sebelah.</p>
              </div>
            </div>
          </div>

          <div
            v-if="referralRS"
            class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div class="p-4 border-b border-gray-100">
              <h3 class="text-[#1d64f2] font-bold">Rekomendasi RS Terdekat</h3>
            </div>

            <div class="h-32 bg-gray-200 w-full relative">
              <img :src="referralRS.image" class="w-full h-full object-cover" />

              <div
                v-if="referralRS.distance"
                class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md flex items-center gap-1 shadow-sm"
              >
                <svg
                  class="w-3 h-3 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  ></path>
                </svg>
                {{ referralRS.distance }} KM
              </div>
            </div>

            <div class="p-4 text-center">
              <h4 class="font-bold text-blue-800 text-sm">
                {{ referralRS.namaRS }}
              </h4>
              <p
                v-if="referralRS.poliTersedia[0]"
                class="text-xs text-gray-600 font-medium"
              >
                {{ referralRS.poliTersedia[0].dokter }}
              </p>
              <div class="flex gap-2 mt-4 justify-center">
                <RouterLink
                  to="/rs-terdekat"
                  class="bg-[#16a34a] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-green-700 transition"
                  >Lihat Detail</RouterLink
                >
              </div>
            </div>
          </div>

          <div
            v-else
            class="bg-white rounded-2xl p-6 flex items-center justify-center text-gray-400 border border-dashed"
          >
            Belum ada data rujukan.
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
