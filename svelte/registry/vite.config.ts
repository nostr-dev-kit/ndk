import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'$lib': path.resolve('./lib'),
			'$registry': path.resolve('./lib/ndk')
		}
	}
});
