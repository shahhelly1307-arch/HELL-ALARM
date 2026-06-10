import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  publicDir: resolve(__dirname, 'assets'),
  build: {
    outDir: '../../dist'
  }
})
