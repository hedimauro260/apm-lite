// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "masked-icon.svg",
        "apple-touch-icon.png",
        "screenshot-desktop.png",
        "screenshot-mobile.png",
      ],
      manifest: {
        name: "Asset Portfolio Manager Lite",
        short_name: "APM LITE",
        description: "Manage your portfolio holdings and track your progress",
        theme_color: "#0b1220",
        background_color: "#0b1220",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/android-icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-desktop.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop view",
          },
          {
            src: "/screenshot-mobile.png",
            sizes: "390x844",
            type: "image/png",
            label: "Mobile view",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "coingecko-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // ✅ Code Splitting com groups (conforme solicitado)
        codeSplitting: {
          groups: [
            // 1. Bibliotecas principais (alta prioridade para ficarem juntas)
            {
              name: "react-core",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
              minSize: 0,
            },
            // 2. Roteamento e estado (se usar)
            {
              name: "router-state",
              test: /[\\/]node_modules[\\/](react-router-dom|@reduxjs|zustand|jotai)[\\/]/,
              priority: 25,
            },
            // 3. UI Framework específico
            {
              name: "ui-framework",
              test: /[\\/]node_modules[\\/](@mui|antd|@chakra-ui)[\\/]/,
              priority: 20,
              maxSize: 300000, // 300KB
            },
            // 4. Bibliotecas de utilidades
            {
              name: "utils",
              test: /[\\/]node_modules[\\/](axios|lodash|date-fns|dayjs|@tanstack)[\\/]/,
              priority: 15,
            },
            // 5. Todo o resto das dependências (com divisão por tamanho)
            {
              name: "vendor",
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              maxSize: 250000, // 250KB - força divisão
              minSize: 10000,
            },
            // 6. Código compartilhado da aplicação
            {
              name: "common",
              minShareCount: 2,
              minSize: 10000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
});
