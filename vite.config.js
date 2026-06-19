import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deployment base path
export default defineConfig({
  base: '/WADANI/',
  plugins: [react()],
})
