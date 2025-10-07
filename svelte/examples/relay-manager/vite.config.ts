import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true,
      },
    }),
  ],
  server: {
    port: 5174,
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    dedupe: ['@nostr-dev-kit/ndk'],
  },
  build: {
    target: 'esnext',
  },
});
