import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "./vitest.config.ts",
    "./ndk-mobile/vitest.config.ts",
    "./wallet/vitest.config.ts",
    "./ndk-hooks/vitest.config.ts",
    "./svelte/registry/vitest.config.ts",
]);
