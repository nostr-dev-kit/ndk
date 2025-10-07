import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                runes: true,
            },
        }),
    ],
    optimizeDeps: {
        exclude: ["@nostr-dev-kit/cache-sqlite-wasm"],
    },
    server: {
        fs: {
            allow: [".."],
        },
    },
    worker: {
        format: "es",
    },
    build: {
        target: "esnext",
    },
});
