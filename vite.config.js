import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

// Originais em alta resolução ficam em /public só como fonte; o site usa /public/img.
// Este plugin os retira do build para não publicá-los.
const ORIGINAIS = ['bastidores', 'caminhao', 'fotos-julio-premium', 'Logos', 'Logos parceiros']
const semOriginais = () => ({
  name: 'sem-originais',
  apply: 'build',
  closeBundle() {
    for (const d of ORIGINAIS) rmSync(resolve('dist', d), { recursive: true, force: true })
  },
})

export default defineConfig({
  // caminhos relativos: o mesmo build funciona na raiz ou em subpasta (GitHub Pages)
  base: './',
  plugins: [react(), semOriginais()],
  server: { host: true, port: 5188 },
})
