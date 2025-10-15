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
        port: 5174,
        fs: {
            allow: [".."],
        },
    },
    optimizeDeps: {
        exclude: ["@nostr-dev-kit/ndk", "@nostr-dev-kit/messages"],
    },
    build: {
        target: "esnext",
    },
});
