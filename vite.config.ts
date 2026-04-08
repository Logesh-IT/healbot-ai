import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          workbox: {
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
          },
          manifest: {
            name: 'HealBot AI',
            short_name: 'HealBot',
            description: 'Advanced Healthcare Companion with AI Intelligence',
            theme_color: '#0f172a',
            icons: [
              {
                src: 'https://picsum.photos/seed/healbot/192/192',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://picsum.photos/seed/healbot/512/512',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'https://picsum.photos/seed/healbot/512/512',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY_2': JSON.stringify(env.GEMINI_API_KEY_2),
        'process.env.GEMINI_API_KEY_3': JSON.stringify(env.GEMINI_API_KEY_3),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        'process.env.HUGGINGFACE_API_KEY': JSON.stringify(env.HUGGINGFACE_API_KEY),
        'process.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(env.VITE_OPENWEATHER_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
