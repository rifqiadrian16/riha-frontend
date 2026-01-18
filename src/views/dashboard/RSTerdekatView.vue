<script setup>
import { ref, onMounted } from "vue";
import { useRouter, RouterLink, useRoute } from "vue-router";
import api from "../../services/api";
import { showAlert, showConfirm } from "../../utils/alert";
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";

const router = useRouter();
const route = useRoute(); // Untuk menangkap filter dari notifikasi
const isSidebarOpen = ref(false);
const currentUser = ref("Pengguna");
const hospitals = ref([]);
const loading = ref(true);
const userLocation = ref(null);

onMounted(async () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;

  await getUserLocation();
  await fetchHospitals();
});

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
          console.error("Gagal ambil lokasi:", error);
          // Tetap lanjut meski tanpa lokasi (nanti jaraknya 0 km)
          resolve();
        },
      );
    } else {
      resolve();
    }
  });
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2) return null;

  const R = 6371; // Radius bumi (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Hasil 1 desimal (contoh: 2.5 km)
};

const fetchHospitals = async () => {
  try {
    loading.value = true;
    const filterSpesialis = route.query.filterSpesialis;

    let url = "/referrals/hospitals";
    if (filterSpesialis) url += `?spesialis=${filterSpesialis}`;

    const response = await api.get(url);

    const rawData = response.data.map((rs) => {
      const jarak = userLocation.value
        ? calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            rs.lat,
            rs.lng,
          )
        : null;

      // --- LOGIKA DINAMIS DOKTER & JADWAL ---
      let displayedDoctor = "Tim Dokter Spesialis";
      let displayedSchedule = "Senin - Sabtu, 08.00 - 20.00"; // Default jika tidak ada data spesifik

      if (rs.dokters && rs.dokters.length > 0) {
        let selectedDoc = null;

        // 1. Coba cari dokter sesuai filter spesialis
        if (filterSpesialis) {
          selectedDoc = rs.dokters.find(
            (d) =>
              d.poli.includes(filterSpesialis) ||
              filterSpesialis.includes(d.poli),
          );
        }

        // 2. Jika tidak ada filter atau dokter tidak ketemu, ambil dokter pertama sbg contoh
        if (!selectedDoc) {
          selectedDoc = rs.dokters[0];
        }

        // 3. Set data tampilan
        if (selectedDoc) {
          displayedDoctor = selectedDoc.nama;
          if (selectedDoc.jadwal) {
            displayedSchedule = selectedDoc.jadwal;
          }
        }
      }
      // ----------------------------------------

      return {
        id: rs.nama,
        name: rs.nama,
        doctor: displayedDoctor, // Nama Dokter Dinamis
        schedule: displayedSchedule, // Jadwal Dokter Dinamis
        image: rs.image || "https://via.placeholder.com/300",
        poli: rs.poli,
        lat: rs.lat,
        lng: rs.lng,
        distance: jarak ? parseFloat(jarak) : 9999,
      };
    });

    hospitals.value = rawData.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error("Gagal ambil data RS", error);
  } finally {
    loading.value = false;
  }
};

const openRoute = (rs) => {
  if (!rs.lat || !rs.lng) {
    showAlert("Maaf", "Koordinat RS ini belum tersedia.", "info");
    return;
  }
  // URL Khusus Google Maps agar langsung mode navigasi
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${rs.lat},${rs.lng}`;
  window.open(mapsUrl, "_blank");
};

// --- Fungsi untuk Memilih RS (Dipanggil saat pasien klik tombol Rujuk) ---
const pilihRS = async (rs) => {
  const referralId = route.query.referralId;

  if (!referralId) {
    showAlert(
      "Mode Lihat Saja",
      "Tunggu notifikasi rujukan dari Admin untuk memilih RS.",
      "info",
    );
    return;
  }

  // Ganti confirm() biasa dengan showConfirm()
  const yakin = await showConfirm(
    "Konfirmasi Rujukan",
    `Pilih ${rs.name} sebagai tempat rujukan Anda?`,
  );

  if (yakin) {
    try {
      await api.put("/referrals/choose", {
        referralId: referralId,
        rsName: rs.name,
        dokterName: "Dokter Spesialis Tersedia",
      });

      await showAlert(
        "Berhasil!",
        "Surat rujukan telah diterbitkan. Cek Inbox Anda.",
        "success",
      );
      router.push("/inbox");
    } catch (error) {
      console.error(error);
      showAlert("Gagal", "Terjadi kesalahan saat memilih RS.", "error");
    }
  }
};

// ... Sidebar logic tetap sama ...
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
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-[#1d64f2]">Rumah Sakit Rujukan</h2>

          <p
            v-if="route.query.filterSpesialis"
            class="text-green-600 font-bold bg-green-50 p-3 rounded-lg mt-2 border border-green-200 inline-block"
          >
            ✅ Menampilkan rekomendasi untuk: {{ route.query.filterSpesialis }}
          </p>
          <p v-else class="text-gray-500 text-sm mt-1">
            Daftar mitra rumah sakit yang tersedia.
          </p>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-400">
          Memuat data RS...
        </div>

        <div
          v-else-if="hospitals.length === 0"
          class="text-center py-10 bg-white rounded-lg shadow"
        >
          <p class="text-gray-500">
            Tidak ada Rumah Sakit yang ditemukan untuk spesialis ini.
          </p>
          <button
            @click="router.push('/rs-terdekat')"
            class="mt-4 text-blue-600 underline text-sm"
          >
            Lihat Semua RS
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="rs in hospitals"
            :key="rs.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col sm:flex-row"
          >
            <div class="sm:w-2/5 h-48 sm:h-auto bg-gray-200 relative">
              <img
                :src="rs.image"
                :alt="rs.name"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow"
              >
                MITRA
              </div>
            </div>

            <div class="p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 class="text-[#1d64f2] font-bold text-lg mb-1">
                  {{ rs.name }}
                </h3>
                <p
                  class="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1"
                >
                  <svg
                    class="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {{ rs.doctor }}
                </p>
                <p class="text-xs text-gray-500 mb-3">{{ rs.schedule }}</p>

                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="poli in rs.poli"
                    :key="poli"
                    class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200"
                  >
                    {{ poli }}
                  </span>
                </div>
              </div>

              <div
                class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100"
              >
                <button
                  @click="openRoute(rs)"
                  class="flex items-center gap-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold px-3 py-2 rounded-lg transition"
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7"
                    ></path>
                  </svg>
                  Rute
                </button>
                <button
                  v-if="route.query.referralId"
                  @click="pilihRS(rs)"
                  class="bg-[#16a34a] hover:bg-green-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition shadow-md w-full sm:w-auto"
                >
                  PILIH RS INI
                </button>
                <button
                  v-else
                  disabled
                  class="bg-gray-100 text-gray-400 text-xs font-bold px-5 py-2 rounded-lg cursor-not-allowed w-full sm:w-auto"
                >
                  Menunggu Rujukan
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
