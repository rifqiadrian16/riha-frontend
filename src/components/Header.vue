<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showConfirm, showAlert } from "../utils/alert"; // Pastikan path utils benar

// 1. Definisi Event untuk komunikasi dengan Parent (View)
// Kita perlu emit event agar tombol burger bisa membuka sidebar di mobile
const emit = defineEmits(["toggle-sidebar"]);

const router = useRouter();
const currentUser = ref("Pengguna");

// 2. Logika Ambil Nama User
onMounted(() => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) currentUser.value = savedUser;
});

// 3. Logika Logout (Terpusat)
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
</script>

<template>
  <header
    class="bg-[#1d64f2] text-white h-16 flex items-center justify-between px-4 lg:px-6 shadow-md shrink-0 z-10"
  >
    <button @click="$emit('toggle-sidebar')" class="lg:hidden text-white mr-4">
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

    <div class="flex items-center gap-6 text-sm font-medium flex-1">
      <div class="hidden md:flex items-center gap-2">
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
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          ></path>
        </svg>
        <span>(0266) 6255503</span>
      </div>
      <div class="hidden md:flex items-center gap-2">
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path>
        </svg>
        <span>riha@gmail.com</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="handleLogout"
        class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition flex items-center gap-1"
      >
        Logout
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          ></path>
        </svg>
      </button>
      <div
        class="h-10 w-10 bg-[#16a34a] rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white uppercase"
      >
        {{ currentUser.charAt(0) }}
      </div>
    </div>
  </header>
</template>
