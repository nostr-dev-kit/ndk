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
    server: {
        port: 5175,
        fs: {
            allow: [".."],
        },
    },
    resolve: {
        dedupe: ["@nostr-dev-kit/ndk"],
    },
    build: {
        target: "esnext",
    },
});
