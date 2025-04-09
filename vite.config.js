import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LVLD',
        short_name: 'LVLD',
        description: 'Every Rep. Every Step.',
        theme_color: '#000000',
        background_color: '#000000',
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
