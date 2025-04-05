import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vitest.config.ts",
  "./ndk-mobile/vitest.config.ts",
  "./ndk-wallet/vitest.config.ts",
  "./ndk-hooks/vitest.config.ts",
])
