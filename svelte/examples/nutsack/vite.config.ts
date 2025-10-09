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
        port: 5173,
        fs: {
            allow: [".."],
        },
    },
    optimizeDeps: {
        exclude: ["@nostr-dev-kit/svelte"],
        include: ["tseep", "debug", "light-bolt11-decoder", "webln"],
    },
    worker: {
        format: "es",
    },
    build: {
        target: "esnext",
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['svelte'],
                    ndk: ['@nostr-dev-kit/ndk', '@nostr-dev-kit/wallet'],
                },
            },
        },
    },
});
