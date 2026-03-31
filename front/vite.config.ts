import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom)/ },
            { name: 'router',       test: /node_modules\/react-router/ },
            { name: 'motion',       test: /node_modules\/motion/ },
            { name: 'charts',       test: /node_modules\/recharts/ },
            { name: 'utils',        test: /node_modules\/(axios|clsx|tailwind-merge|class-variance-authority|lucide-react)/ },
          ],
        },
      },
    },
  },
})
