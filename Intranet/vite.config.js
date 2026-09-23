import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: funciona igual en local, en la raíz de un dominio
  // y bajo un subpath como GitHub Pages (usuario.github.io/Intranet/).
  base: './',
  plugins: [react()],
  // En desarrollo la API de cumpleaños corre aparte (npm run dev:api).
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
})
