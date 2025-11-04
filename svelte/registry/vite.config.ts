import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [
		sveltekit()
	],
	build: {
		rollupOptions: {
			onLog(level, log, handler) {
				// Suppress unused import info messages
				if (log.message?.includes('imported from external module') && log.message?.includes('but never used')) {
					return;
				}
				handler(level, log);
			},
			onwarn(warning, warn) {
				// Suppress unused import warnings
				if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
					return;
				}
				warn(warning);
			}
		}
	}
});
