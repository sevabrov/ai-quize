import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    watch: {
      /**
       * КРИТИЧНО: json-server перезаписує db.json після кожної відповіді.
       * Без цього виключення Vite бачить зміну файлу в корені проєкту
       * і робить full reload — активний екран квізу «блимає» і зникає.
       */
      ignored: ['**/db.json', '**/db-*.json'],
    },
  },
  preview: {
    port: 4173,
  },
})
