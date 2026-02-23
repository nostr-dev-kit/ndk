import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			// Fix noble package subpath imports
			'@noble/curves/secp256k1.js': '@noble/curves/esm/secp256k1.js',
			'@noble/hashes/utils.js': '@noble/hashes/esm/utils.js',
			'@noble/hashes/sha2.js': '@noble/hashes/esm/sha2.js',
			'@noble/hashes/hkdf.js': '@noble/hashes/esm/hkdf.js',
			'@noble/hashes/hmac.js': '@noble/hashes/esm/hmac.js',
			'@noble/hashes/scrypt.js': '@noble/hashes/esm/scrypt.js',
			'@noble/hashes/sha256.js': '@noble/hashes/esm/sha256.js',
			'@noble/hashes/sha512.js': '@noble/hashes/esm/sha512.js'
		}
	},
	optimizeDeps: {
		// Don't pre-bundle nostr-tools since it has import issues
		exclude: ['nostr-tools', '@nostr-dev-kit/ndk']
	}
});
