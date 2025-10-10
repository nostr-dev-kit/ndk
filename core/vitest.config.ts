import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./test/setup/vitest.setup.ts"],
        include: ["src/**/*.test.ts"],
        exclude: ["**/*bun.test.ts", "**/node_modules/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
        },
        benchmark: {
            include: ["benchmarks/**/*.bench.ts"],
        },
    },
});
