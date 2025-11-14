import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
