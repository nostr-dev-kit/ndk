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
});
