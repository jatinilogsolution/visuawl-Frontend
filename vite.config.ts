import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),

    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),

    babel({ presets: [reactCompilerPreset()] }),

  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  }, server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
