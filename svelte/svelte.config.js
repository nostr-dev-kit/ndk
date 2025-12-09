import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
    },
    compilerOptions: {
        runes: undefined,
    },
    onwarn: (warning, handler) => {
        // Suppress legacy export warnings from Storybook addon packages
        if (warning.code === 'legacy_export_invalid' && warning.filename?.includes('node_modules/@storybook')) {
            return;
        }
        handler(warning);
    }
};

export default config;
