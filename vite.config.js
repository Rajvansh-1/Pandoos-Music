import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  // Path aliases — use @/ instead of ../../../
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@features': resolve(__dirname, './src/features'),
      '@components': resolve(__dirname, './src/components'),
      '@stores': resolve(__dirname, './src/stores'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@styles': resolve(__dirname, './src/styles'),
      '@lib': resolve(__dirname, './src/lib'),
      '@types': resolve(__dirname, './src/types'),
    },
  },

  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },

  server: {
    port: 5173,
    strictPort: false,
    // Required for Capacitor live reload
    host: true,
  },

  preview: {
    port: 4173,
  },
});
