---
"@nostr-dev-kit/ndk": patch
"@nostr-dev-kit/ndk-cache-sqlite-wasm": patch
---

Add filter validation to prevent undefined values in subscription filters

Prevents runtime errors in cache adapters (especially SQLite WASM) that cannot handle undefined values in parameterized queries.

The NDK constructor now accepts a `filterValidationMode` option:
- `"validate"` (default): Throws an error when filters contain undefined values
- `"fix"`: Automatically removes undefined values from filters
- `"ignore"`: Skip validation entirely (legacy behavior)

This fixes the "Wrong API use: tried to bind a value of an unknown type (undefined)" error in sqlite-wasm cache adapter.