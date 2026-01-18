<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// PERBAIKAN LOGIC 1: Fungsi untuk menutup menu saat link diklik (UX Mobile)
const closeMenu = () => {
  isMobileMenuOpen.value = false
}

// Efek Navbar berubah warna saat di-scroll
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-blue-50/30 font-sans text-gray-800 overflow-hidden selection:bg-blue-200">
    
    <nav 
      class="fixed top-0 w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-blue-100"
      :class="isScrolled ? 'shadow-md py-2' : 'shadow-sm py-4'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          
          <div class="flex-shrink-0 flex items-center gap-2 cursor-pointer" @click="closeMenu">
            <a href="#beranda" class="flex items-center gap-2">
                <div class="h-9 w-9 bg-white rounded-full flex items-center justify-center overflow-hidden border border-blue-200 shadow-sm p-0.5">
                   <img src="/images/logo-riha.jpg" alt="RiHa Logo" class="h-full w-full object-cover">
                </div>
                <div>
                  <h1 class="text-lg font-extrabold tracking-tight leading-none text-gray-900">
                    <span class="text-[#1d64f2]">RiHa</span>
                    <span class="text-[#16a34a]"> Medical Center</span>
                  </h1>
                </div>
            </a>
          </div>

          <div class="hidden md:flex space-x-8">
            <a href="#beranda" class="text-sm font-bold text-gray-600 hover:text-[#1d64f2] transition hover:scale-105 transform">Beranda</a>
            <a href="#layanan" class="text-sm font-bold text-gray-600 hover:text-[#1d64f2] transition hover:scale-105 transform">Layanan</a>
            <a href="#tentang" class="text-sm font-bold text-gray-600 hover:text-[#1d64f2] transition hover:scale-105 transform">Tentang Kami</a>
          </div>

          <div class="hidden md:flex items-center gap-3">
            <RouterLink to="/login" class="text-[#1d64f2] font-bold text-xs hover:bg-blue-50 px-4 py-2 rounded-full transition border border-transparent hover:border-blue-100">
              Masuk
            </RouterLink>
            <RouterLink to="/register" class="bg-[#1d64f2] hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold text-xs shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5">
              Daftar Sekarang
            </RouterLink>
          </div>

          <div class="md:hidden flex items-center">
            <button @click="toggleMenu" class="text-gray-600 hover:text-[#1d64f2] focus:outline-none transition p-1.5 bg-gray-50 rounded-md shadow-sm border border-gray-100">
              <svg v-if="!isMobileMenuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform -translate-y-2 opacity-0">
        <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t border-blue-50 shadow-xl absolute w-full rounded-b-2xl mx-2 mt-1 left-0 right-0">
          <div class="px-4 pt-3 pb-5 space-y-1">
            <a href="#beranda" @click="closeMenu" class="block px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-[#1d64f2] hover:bg-blue-50 transition">Beranda</a>
            <a href="#layanan" @click="closeMenu" class="block px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-[#1d64f2] hover:bg-blue-50 transition">Layanan</a>
            <a href="#tentang" @click="closeMenu" class="block px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-[#1d64f2] hover:bg-blue-50 transition">Tentang Kami</a>
            
            <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
              <RouterLink to="/login" class="text-center px-3 py-2 rounded-lg font-bold text-xs text-[#1d64f2] border border-blue-100 hover:bg-blue-50 transition">Masuk</RouterLink>
              <RouterLink to="/register" class="text-center px-3 py-2 rounded-lg font-bold text-xs bg-[#1d64f2] text-white shadow-md hover:bg-blue-700 transition">Daftar</RouterLink>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <section id="beranda" class="relative pt-32 pb-16 lg:pt-40 lg:pb-24">
      
      <div class="absolute top-14 right-0 z-0 pointer-events-none hidden lg:block w-[280px]">
          <img src="/images/gambar-2.png" alt="Dekorasi Papan Jalan" class="w-full h-auto opacity-80 animate-float-slow mix-blend-multiply">
      </div>
      
      <div class="absolute bottom-0 left-0 z-0 pointer-events-none w-[180px] lg:w-[220px]">
          <img src="/images/gambar-1.png" alt="Dekorasi Tas P3K" class="w-full h-auto opacity-80 animate-float-slower mix-blend-multiply">
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-[#1d64f2] rounded-full text-[10px] lg:text-xs font-bold mb-4 border border-blue-200 shadow-sm animate-fade-in-down">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Sistem Antri Cerdas No.1
            </div>
            
            <h1 class="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
              Sehat Lebih Cepat,<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#1d64f2] to-[#16a34a]">Tanpa Antri Lama.</span>
            </h1>
            
            <p class="text-base lg:text-lg text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              Platform digital terintegrasi untuk pendaftaran dan rujukan RSUD Sukabumi.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <RouterLink to="/register" class="px-6 py-3 bg-[#1d64f2] hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm">
                Ambil Antrean
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </RouterLink>
              <button class="px-6 py-3 bg-white border border-gray-200 text-gray-600 hover:border-[#1d64f2] hover:text-[#1d64f2] rounded-full font-bold transition shadow-sm text-sm">
                Lihat Jadwal
              </button>
            </div>
          </div>
          
          <div class="relative flex items-center justify-center lg:justify-end animate-fade-in-up lg:mr-16">
             <img src="/images/logo-riha.jpg" alt="Logo RiHa Besar" class="w-full max-w-xs lg:max-w-sm drop-shadow-xl rounded-full border-4 border-white animate-float">
          </div>

        </div>
      </div>
    </section>

    <section id="layanan" class="py-16 lg:py-20 bg-white relative overflow-hidden">
      
      <img src="/images/gambar-3.png" class="absolute top-8 left-0 w-24 lg:w-36 opacity-60 animate-float-slow pointer-events-none">
      <img src="/images/gambar-4.png" class="absolute -bottom-9 -right-4 w-40 lg:w-56 opacity-80 animate-float pointer-events-none">

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-3">Layanan Unggulan</h2>
          <p class="text-gray-600 max-w-xl mx-auto text-base">Solusi digital untuk pengalaman berobat yang nyaman.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div class="bg-white p-6 rounded-[1.5rem] shadow-lg shadow-blue-100/50 hover:shadow-xl transition duration-300 border border-blue-50 group transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1d64f2] transition shadow-sm">
              <svg class="w-6 h-6 text-[#1d64f2] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-2 group-hover:text-[#1d64f2] transition">Antrean Online</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Daftar dari rumah, datang saat giliran sudah dekat. Hemat waktu tunggu.</p>
          </div>

          <div class="bg-white p-6 rounded-[1.5rem] shadow-lg shadow-green-100/50 hover:shadow-xl transition duration-300 border border-green-50 group transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#16a34a] transition shadow-sm">
              <svg class="w-6 h-6 text-[#16a34a] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-2 group-hover:text-[#16a34a] transition">Status Real-time</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Pantau nomor antrean yang dipanggil langsung dari HP Anda.</p>
          </div>

          <div class="bg-white p-6 rounded-[1.5rem] shadow-lg shadow-purple-100/50 hover:shadow-xl transition duration-300 border border-purple-50 group transform hover:-translate-y-1">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition shadow-sm">
              <svg class="w-6 h-6 text-purple-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-2 group-hover:text-purple-600 transition">Jadwal Dokter</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Cek ketersediaan dokter spesialis dan pilih jadwal yang sesuai.</p>
          </div>
        </div>
      </div>
    </section>

    <footer id="tentang" class="bg-gray-50 border-t border-gray-200 pt-12 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="mb-6 flex justify-center items-center gap-2">
           <img src="/images/logo-riha.jpg" alt="Logo" class="h-8 w-8 rounded-full shadow-sm border border-white">
           <span class="text-lg font-extrabold text-gray-900 tracking-tight">RiHa <span class="text-[#1d64f2]">Medical Center</span></span>
        </div>
        
        <p class="text-gray-500 text-xs mb-6">
          &copy; 2025 RiHa Medical Center. Melayani dengan sepenuh hati.
        </p>
        
        <div class="flex justify-center gap-6 text-xs font-bold text-gray-400">
          <a href="#" class="hover:text-[#1d64f2]">Privacy Policy</a>
          <a href="#" class="hover:text-[#1d64f2]">Terms of Service</a>
          <a href="#" class="hover:text-[#1d64f2]">Contact</a>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* PERBAIKAN LOGIC 2: Smooth Scrolling untuk perpindahan antar section */
html {
  scroll-behavior: smooth;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
@keyframes floatSlower {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(15px); }
}

.animate-float { animation: float 4s ease-in-out infinite; }
.animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
.animate-float-slower { animation: floatSlower 8s ease-in-out infinite; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 20px, 0); }
  to { opacity: 1; transform: none; }
}
@keyframes fadeInDown {
    from { opacity: 0; transform: translate3d(0, -20px, 0); }
    to { opacity: 1; transform: none; }
}
.animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
.animate-fade-in-down { animation: fadeInDown 0.6s ease-out; }
</style>
