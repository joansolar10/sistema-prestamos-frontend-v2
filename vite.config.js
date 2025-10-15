// frontend-prestamos/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🎯 LÍNEA CLAVE: Añade esta propiedad
  base: '/', 
  // Esto le dice a Vite que la base de la aplicación es la raíz del servidor.
})