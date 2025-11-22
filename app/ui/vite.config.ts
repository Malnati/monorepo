// app/uivite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// VITE_API_BASE_URL é obrigatória em produção, mas pode ter fallback em desenvolvimento
const API_BASE_URL = process.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
if (!API_BASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error("VITE_API_BASE_URL não está configurada. Configure no docker-compose.yml ou .env");
}

export default defineConfig({
  build: {
    sourcemap: true, // Habilitar source maps para debugging
    minify: 'esbuild',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'vite.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'assets/*.png',
        'assets/*.svg',
        'offline.html'
      ],
      manifest: {
        name: 'APP Marketplace',
        short_name: 'APP',
        description: 'Plataforma de negociação de produtos e serviços',
        theme_color: '#28a745',
        background_color: '#f6f8f6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/offers/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offers-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutos
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 80,
    host: true,
    strictPort: false,
    // Configuração dinâmica de hosts permitidos
    // Strings começando com '.' são tratadas como wildcards de domínio
    // Permite qualquer subdomínio de cranio.dev
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.cranio.dev',
      'monorepo.cranio.dev',
    ],
  },
});
