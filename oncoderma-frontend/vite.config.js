import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exponer en todas las interfaces de red
    port: 3000,
    open: true,
    strictPort: false, // Permitir usar otro puerto si 3000 está ocupado
    allowedHosts: [
      '.trycloudflare.com', // Permitir todos los subdominios de Cloudflare
      'ringtones-incomplete-delays-reseller.trycloudflare.com', // Tu túnel específico
      'localhost',
      '192.168.0.16'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'components': [],
          'pages': []
        }
      }
    }
  }
})
