import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                runes: true,
            },
        }),
    ],
    optimizeDeps: {
        exclude: ["@nostr-dev-kit/ndk-cache-sqlite-wasm"],
    },
    server: {
        fs: {
            allow: [".."],
        },
    },
});
