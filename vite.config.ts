import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/space_typing/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
