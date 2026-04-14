<script setup>
import { ref, onMounted } from 'vue'

const deferredPrompt = ref(null)
const showInstallBanner = ref(false)

onMounted(() => {
  // Menangkap event dari browser saat PWA siap diinstal
  window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah browser memunculkan mini-infobar bawaan secara otomatis
    e.preventDefault()
    // Menyimpan event untuk dipicu nanti
    deferredPrompt.value = e
    // Menampilkan banner custom kita
    showInstallBanner.value = true
  })
})

const installPWA = async () => {
  if (!deferredPrompt.value) return
  
  // Memunculkan dialog instalasi bawaan browser
  deferredPrompt.value.prompt()
  
  // Menunggu respon pengguna (Apakah klik Instal atau Batal)
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    console.log('User menerima instalasi PWA')
    showInstallBanner.value = false
  } else {
    console.log('User menolak instalasi PWA')
  }
  
  // Reset prompt
  deferredPrompt.value = null
}

const dismissBanner = () => {
  showInstallBanner.value = false
}
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
