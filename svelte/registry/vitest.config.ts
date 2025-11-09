import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

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
            instances: [
                {
                    browser: "chromium",
                },
            ],
            provider: playwright(),
            headless: true,
        },
        globals: true,
        include: ["src/**/*.test.ts", "src/**/*.svelte.test.ts", "src/**/*.spec.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/lib/registry/**/*.ts", "src/lib/registry/**/*.svelte.ts", "src/lib/registry/**/*.svelte"],
            exclude: [
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/*.svelte.test.ts",
                "**/test-utils.ts",
                "**/types.ts",
                "**/index.ts",
                "**/examples/**",
                "**/*.example.svelte",
            ],
            thresholds: {
                lines: 50,
                functions: 50,
                branches: 50,
                statements: 50,
            },
        },
    },
    define: {
        "process.env.NODE_ENV": '"test"',
    },
});
