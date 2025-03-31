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
    resolve: {
        alias: {
            "@nostr-dev-kit/ndk": path.resolve(__dirname, "../ndk-core/src/index.ts"),
            "@nostr-dev-kit/ndk-test-utils": path.resolve(
                __dirname,
                "../ndk-test-utils/src/index.ts"
            ),
        },
    },
});
