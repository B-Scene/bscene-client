import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    VitePWA({
      // site.webmanifest is already generated under public/favicon and linked from index.html
      manifest: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon/favicon.ico', 'favicon/favicon.svg', 'favicon/apple-touch-icon.png'],
      workbox: {
        // 앱 셸(코드/스타일/폰트)만 프리캐시. 이미지, API 응답, 라이브 스트림은 캐싱하지 않음.
        globPatterns: ['**/*.{js,css,html,woff,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
