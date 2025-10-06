import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        testTimeout: 60000,
        hookTimeout: 60000,
    },
});
