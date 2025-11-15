import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      base: '/',
      build: {
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        },
        cssCodeSplit: false,
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['*.replit.dev', 'localhost'],
        proxy: {
          '/admin/': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/exams': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/health': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/customer-access': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/customer-login': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/customer-recover': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        // Gemini API removed - using mock questions instead
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
