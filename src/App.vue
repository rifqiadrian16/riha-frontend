<script setup>
import { ref, onMounted } from 'vue'
import api from "./services/api";
import { getPendingQueue, removePendingQueue } from "./utils/offlineQueue";
import { showToast } from "./utils/alert";

const deferredPrompt = ref(null)
const showInstallBanner = ref(false)

const flushPendingQueue = async () => {
  const pending = getPendingQueue();
  if (pending.length === 0) return;

  // CEK TOKEN: Jangan coba sinkron jika user belum login
  const token = localStorage.getItem("token");
  if (!token) return;

  for (const item of pending) {
    try {
      const { _localId, ...payload } = item;
      
      // Tembak API
      await api.post("/queue", payload);
      
      // Jika sukses, hapus dari localStorage
      removePendingQueue(_localId);
      showToast(`Antrean ${payload.namaPasien} berhasil disinkronkan`, "success");
      
      // [BARU] Kirim sinyal ke seluruh aplikasi bahwa ada data yang sukses masuk!
      window.dispatchEvent(new Event('queue-synced'));
      
    } catch (err) {
      console.warn("Gagal sync item, akan dicoba lagi:", err);
      break; 
    }
  }
};

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallBanner.value = true;
  });

  // Jalankan flush saat sinyal internet nyala
  window.addEventListener('online', () => {
    flushPendingQueue();
  });

  // Jalankan flush saat user membuka/berpindah kembali ke tab aplikasi RiHa
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      flushPendingQueue();
    }
  });

  // Cek antrean saat aplikasi pertama dibuka
  if (navigator.onLine) flushPendingQueue();
});

const installPWA = async () => {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    console.log('User menerima instalasi PWA');
    showInstallBanner.value = false;
  } else {
    console.log('User menolak instalasi PWA');
  }
  deferredPrompt.value = null;
};

const dismissBanner = () => {
  showInstallBanner.value = false;
};
</script>

<template>
  <router-view></router-view>

  <div 
    v-if="showInstallBanner" 
    class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[9999] flex flex-col sm:flex-row items-center justify-between gap-4"
  >
    <div class="flex items-center gap-4">
      <img src="/pwa-192x192.png" alt="Logo RiHa" class="w-12 h-12 rounded-xl" />
      <div>
        <h4 class="font-bold text-gray-800">Instal Aplikasi RiHa</h4>
        <p class="text-xs text-gray-500">Akses lebih cepat, hemat kuota, & fitur offline.</p>
      </div>
    </div>
    <div class="flex gap-2 w-full sm:w-auto">
      <button 
        @click="dismissBanner" 
        class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        Nanti
      </button>
      <button 
        @click="installPWA" 
        class="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
      >
        Instal Sekarang
      </button>
    </div>
  </div>
</template>
