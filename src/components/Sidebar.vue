<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client"; // Import Socket
import { useRouter, RouterLink } from "vue-router";
import api from "../services/api"; // Sesuaikan path jika perlu (biasanya ../services/api)
import { showAlert, showConfirm } from "../utils/alert"; // Sesuaikan path
let socket = null;
// Menerima Props dari Parent (Halaman Utama) untuk kontrol Mobile Menu
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

// Mengirim Event ke Parent
const emit = defineEmits(["close"]);

const router = useRouter();
const userRole = ref("");
const unreadCount = ref(0);

// --- LOGIKA NOTIFIKASI & ROLE ---
const checkUnread = async () => {
  try {
    const response = await api.get("/referrals/pending");
    unreadCount.value = response.data.length;
  } catch (error) {
    console.error(err);
  }
};

// --- LIFECYCLE ---
onMounted(() => {
  // Cek Role User
  const role = localStorage.getItem("role");
  if (role) userRole.value = role;

  checkUnread();

  const envUrl =
    import.meta.env.VITE_API_URL ||
    "https://riha-backend-production.up.railway.app";

  const socketUrl = envUrl.replace("/api", "");

  // Inisialisasi Socket dengan URL Dinamis
  socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  socket.on("referral_updated", () => {
    console.log("🔔 TING! Ada rujukan baru masuk via Socket!");

    unreadCount.value += 1;

    checkUnread();
  });
});

onUnmounted(() => {
  // [BARU] Putus koneksi socket saat pindah halaman
  if (socket) socket.disconnect();
});

// Fungsi pembantu untuk menutup sidebar saat menu diklik (Mobile)
const closeSidebar = () => {
  if (window.innerWidth < 1024) {
    emit("close");
  }
};
</script>

<template>
  <aside
    class="fixed lg:static inset-y-0 left-0 w-64 bg-[#1d64f2] text-white flex flex-col shadow-2xl z-30 transform transition-transform duration-300 ease-in-out lg:transform-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div
      class="h-28 flex items-center justify-center px-4 border-b border-blue-400/30"
    >
      <div
        class="w-full h-20 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden relative group"
      >
        <img
          src="/images/logo-riha.jpg"
          alt="Logo RiHa"
          class="w-full h-full object-contain p-2"
        />
      </div>
    </div>

    <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
      <RouterLink
        to="/dashboard"
        @click="closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all opacity-80 hover:opacity-100 hover:bg-blue-600"
        active-class="bg-blue-800/50 border-l-4 border-white opacity-100 shadow-inner font-bold"
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          ></path>
        </svg>
        <span class="text-sm">Dashboard</span>
      </RouterLink>

      <RouterLink
        to="/antrean"
        @click="closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all opacity-80 hover:opacity-100 hover:bg-blue-600"
        active-class="bg-blue-800/50 border-l-4 border-white opacity-100 shadow-inner font-bold"
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span class="text-sm">Antrean</span>
      </RouterLink>

      <RouterLink
        to="/rs-terdekat"
        @click="closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all opacity-80 hover:opacity-100 hover:bg-blue-600"
        active-class="bg-blue-800/50 border-l-4 border-white opacity-100 shadow-inner font-bold"
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
        <span class="text-sm">RS Terdekat</span>
      </RouterLink>

      <RouterLink
        to="/inbox"
        @click="closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all opacity-80 hover:opacity-100 hover:bg-blue-600"
        active-class="bg-blue-800/50 border-l-4 border-white opacity-100 shadow-inner font-bold"
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path>
        </svg>
        <span class="text-sm">Inbox</span>
      </RouterLink>

      <RouterLink
        to="/notifikasi"
        @click="closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all opacity-80 hover:opacity-100 hover:bg-blue-600 relative"
        active-class="bg-blue-800/50 border-l-4 border-white opacity-100 shadow-inner font-bold"
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          ></path>
        </svg>
        <span class="text-sm">Notifikasi</span>

        <span
          v-if="unreadCount > 0"
          class="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse border border-white"
        >
          {{ unreadCount }}
        </span>
      </RouterLink>

      <RouterLink
        to="/pengaturan"
        @click="closeSidebar"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all opacity-80 hover:opacity-100 hover:bg-blue-600"
        active-class="bg-blue-800/50 border-l-4 border-white opacity-100 shadow-inner font-bold"
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        <span class="text-sm">Pengaturan</span>
      </RouterLink>

      <RouterLink
        v-if="userRole === 'admin'"
        to="/admin/antrean"
        class="flex items-center gap-3 px-4 py-3 mb-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg border border-red-400"
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
        <span class="font-bold tracking-wide uppercase text-xs"
          >Admin Panel</span
        >
      </RouterLink>
    </nav>

    <div class="p-4 text-xs text-blue-200 border-t border-blue-500">
      <p class="mb-3 font-semibold text-blue-100">
        &copy; 2025 RiHa Medical Center
      </p>
      <div class="flex flex-col gap-2">
        <a
          href="#"
          class="hover:text-white transition-colors flex items-center gap-2 group"
          ><svg
            class="w-3 h-3"
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
          Kebijakan Privasi</a
        >
        <a
          href="#"
          class="hover:text-white transition-colors flex items-center gap-2 group"
          ><svg
            class="w-3 h-3"
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
          Syarat & Ketentuan</a
        >
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Gunakan styling scrollbar yang sudah Anda punya */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
