import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    vue(),
    ViteImageOptimizer({ 
      webp: {
        quality: 80,
      },
      png: { quality: 80 },
      jpeg: { quality: 80 },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg}'],
        runtimeCaching: [
          {
            // Strategi Caching untuk API Backend (Riset Anda)
            urlPattern: /^https:\/\/.*\.vercel\.app\/api\/.*/i,
            handler: 'NetworkFirst', // Utamakan network, jika offline pakai cache
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 Hari
              },
              networkTimeoutSeconds: 10 // Jika 10 detik sinyal jelek, langsung pakai offline cache
            }
          }
        ]
      },
      manifest: {
        name: 'RiHa - Layanan Kesehatan',
        short_name: 'RiHa',
        description: 'Sistem Antrean & Rujukan RS Terdekat',
        theme_color: '#ffffff',
        start_url:'/',
        display:'standalone',
        background_color:'#ffffff',
        icons: [
          // ANDA WAJIB MENAMBAHKAN 2 GAMBAR INI NANTI DI FOLDER public/
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})