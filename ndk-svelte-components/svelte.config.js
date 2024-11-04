import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: preprocess(),
    compilerOptions: {
        customElement: true,
    },
    kit: {
        adapter: adapter(),
    },
};

export default config;
