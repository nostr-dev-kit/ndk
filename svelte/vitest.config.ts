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
        browser: {
            enabled: true,
            name: "chromium",
            provider: "playwright",
            headless: true,
        },
        globals: true,
        include: ["src/**/*.test.ts", "src/**/*.svelte.test.ts", "src/**/*.spec.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/lib/**/*.ts", "src/lib/**/*.svelte.ts"],
            exclude: [
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/*.svelte.test.ts",
                "**/test-utils.ts",
                "**/types.ts",
            ],
            thresholds: {
                lines: 60,
                functions: 60,
                branches: 60,
                statements: 60,
            },
        },
    },
    define: {
        "process.env.NODE_ENV": '"test"',
    },
});
