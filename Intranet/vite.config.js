import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // La intranet se sirve desde la raíz del dominio (Railway); con rutas absolutas los recursos cargan
  // bien aunque alguien abra una URL profunda como /algo/que/no/existe.
  base: '/',
  plugins: [react()],
  // En desarrollo la API de cumpleaños corre aparte (npm run dev:api).
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
})
