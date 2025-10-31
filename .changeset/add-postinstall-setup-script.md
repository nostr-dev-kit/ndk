---
"@nostr-dev-kit/cache-sqlite-wasm": patch
---

Add intelligent postinstall script that detects framework (Vite, Next.js, SvelteKit, Nuxt, Astro) and provides setup instructions for copying worker.js and sql-wasm.wasm files. Script automatically skips in CI environments and can be silenced with SKIP_NDK_CACHE_SETUP=1.
