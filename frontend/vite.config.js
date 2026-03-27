import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'hero_background.jpeg'],
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:3000\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      manifest: {
        name: "Mom's Magic",
        short_name: "Mom's Magic",
        description: "Home-cooked meals delivered daily — find verified home cooks near you",
        theme_color: '#EA580C',
        background_color: '#FFF7ED',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['food', 'lifestyle'],
        icons: [
          { src: '/icons/pwa-72x72.png',   sizes: '72x72',   type: 'image/png' },
          { src: '/icons/pwa-96x96.png',   sizes: '96x96',   type: 'image/png' },
          { src: '/icons/pwa-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/pwa-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/pwa-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/pwa-180x180.png', sizes: '180x180', type: 'image/png' },
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'glow-william-ownership-flavor.trycloudflare.com',
      '.vercel.app',
    ],
  },
})
