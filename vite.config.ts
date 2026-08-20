import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiOrigin = new URL(
    env.VITE_API_BASE_URL || 'https://api.bscene.app/api',
  ).origin

  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      VitePWA({
        // site.webmanifest is already generated under public/favicon and linked from index.html
        manifest: false,
        injectRegister: false,
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon/favicon.ico',
          'favicon/favicon.svg',
          'favicon/apple-touch-icon.png',
        ],
        workbox: {
          // Cache only app code and styles, not API responses or live streams.
          globPatterns: ['**/*.{js,css,html,woff,woff2}'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '^/(?:(?:hls|rtc)/)?[0-9a-fA-F-]{36}/': {
          target: apiOrigin,
          changeOrigin: true,
          followRedirects: true,
        },
      },
    },
  }
})
