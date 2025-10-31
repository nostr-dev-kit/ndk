import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [
		sveltekit()
	]
});
