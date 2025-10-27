import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'@nostr-dev-kit/svelte/builders/event-content': path.resolve('../src/lib/builders/event-content')
		}
	}
});
