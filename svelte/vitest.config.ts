import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                runes: true,
            },
            hot: false,
        }),
    ],
    resolve: {
        extensions: [".mjs", ".js", ".ts", ".svelte", ".svelte.ts", ".svelte.js"],
    },
    test: {
        environment: "jsdom",
        globals: true,
        include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        setupFiles: ["./src/test/setup.ts"],
    },
    define: {
        "process.env.NODE_ENV": '"test"',
    },
});
