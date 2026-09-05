import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: funciona igual en local, en la raíz de un dominio
  // y bajo un subpath como GitHub Pages (usuario.github.io/Intranet/).
  base: './',
  plugins: [react()],
})
