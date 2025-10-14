import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Skip type generation for now
  clean: true,
  sourcemap: true,
  splitting: false,
  external: ['@nostr-dev-kit/ndk', 'nostr-tools', 'eventemitter3'],
});