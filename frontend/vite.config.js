import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Generate version from timestamp or env variable
const APP_VERSION = process.env.VITE_APP_VERSION || Date.now().toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
  },
  build: {
    // Ensure proper cache busting
    rollupOptions: {
      output: {
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Generate sourcemaps in production for debugging
    sourcemap: false,
  },
  server: {
    port: 8080,
    open: true,
    proxy: {
      // Proxy image requests to backend to avoid CORS issues
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

