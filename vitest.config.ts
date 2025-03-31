import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./test/setup/vitest.setup.ts"],
        include: ["src/**/*.test.ts", "ndk/src/**/*.test.ts", "test/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: ["**/node_modules/**", "**/test/**"],
        },
        testTimeout: 10000,
    },
});
