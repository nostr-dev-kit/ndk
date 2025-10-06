import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5174,
  },
  resolve: {
    dedupe: ['@nostr-dev-kit/ndk'],
  },
});
