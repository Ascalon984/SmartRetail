import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Konfigurasi ini WAJIB untuk deployment ke GitHub Pages dengan format domain github.io/repo-name/
  base: '/SmartRetail/',
})
