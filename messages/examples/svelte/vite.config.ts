import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import path from "path";

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
    resolve: {
        alias: {
            "@nostr-dev-kit/ndk": path.resolve(__dirname, "../../../core/src/index.ts"),
            "@nostr-dev-kit/messages": path.resolve(__dirname, "../../../messages/src/index.ts"),
        },
    },
    optimizeDeps: {
        exclude: ["@nostr-dev-kit/ndk", "@nostr-dev-kit/messages"],
    },
    build: {
        target: "esnext",
    },
});
