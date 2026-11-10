import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // caminhos relativos: o mesmo build funciona na raiz ou em subpasta (GitHub Pages)
  base: './',
  plugins: [react()],
  server: { host: true, port: 5188 },
})
