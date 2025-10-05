import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                runes: true,
            },
        }),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, "src/lib/index.ts"),
                stores: resolve(__dirname, "src/lib/stores/index.ts"),
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: ["svelte", "@nostr-dev-kit/ndk", "@nostr-dev-kit/ndk-wallet"],
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
});
