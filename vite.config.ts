// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'masked-icon.svg', 'apple-touch-icon.png', 'screenshot-desktop.png', 'screenshot-mobile.png'],
      manifest: {
        name: 'Asset Portfolio Manager Lite',
        short_name: 'APM LITE',
        description: 'Manage your portfolio holdings and track your progress',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          // ✅ Screenshot para desktop (wide)
          {
            src: '/screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: "Home Screen on desktop",
          },
          // ✅ Screenshot para mobile (narrow)
          {
            src: '/screenshot-mobile.png',
            sizes: '390x884',
            type: 'image/png',
            form_factor: 'narrow',
            label: "Home Screen on mobile",
          },
        ]
      }
    })
  ],
});