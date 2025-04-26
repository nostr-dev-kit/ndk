# Bundling and Runtime Setup for Web Worker and WASM

This guide explains how the build process is configured to support the Web Worker and WASM file for the NDK Cache SQLite WASM adapter, and how to reference them at runtime.

## Build Output

The build process (see `package.json` scripts) produces:

- `dist/worker.js`: The bundled Web Worker script, built from `src/worker.ts` as an ES module for browser use.
- `dist/sql-wasm.wasm`: The WASM binary, copied from `example/sql-wasm.wasm`.

Both files must be accessible to your application at runtime.

## Build Script

The relevant build script in `package.json`:

```json
"build": "bun build ./src/index.ts --outdir ./dist --format cjs --target node && bun build ./src/index.ts --outfile ./dist/index.mjs --format esm --target browser && bun build ./src/worker.ts --outfile ./dist/worker.js --format esm --target browser && cp ./example/sql-wasm.wasm ./dist/sql-wasm.wasm"
```

This ensures:
- The main adapter and the worker are both bundled for their respective targets.
- The WASM file is available in the output directory.

## Referencing the Worker and WASM at Runtime

When initializing the adapter, you must provide URLs for the worker and WASM file that are accessible from the browser:

```typescript
import { NDKCacheAdapterSqliteWasm } from '@nostr-dev-kit/ndk-cache-sqlite-wasm';

const adapter = new NDKCacheAdapterSqliteWasm({
  useWorker: true,
  workerUrl: '/dist/worker.js', // Adjust path as served by your web server
  wasmUrl: '/dist/sql-wasm.wasm' // Adjust path as served by your web server
});
```

- `workerUrl`: The URL to the worker script. This should point to the built `worker.js` file as served by your web server.
- `wasmUrl`: The URL to the WASM file. This should point to the built `sql-wasm.wasm` file as served by your web server.

**Note:** If you use a different public directory or deploy files elsewhere, adjust these URLs accordingly.

## Serving the Files

Ensure your web server or static hosting setup serves `dist/worker.js` and `dist/sql-wasm.wasm` at the URLs you provide to the adapter.

For local development, you may need to copy or symlink these files into your public directory, or configure your server to serve from `dist/`.

## Bun-Specific Notes

- The build process uses Bun's `bun build` for both the main and worker scripts.
- The worker script is built as an ES module for browser compatibility.
- The WASM file is simply copied; no special loader is required.

## Troubleshooting

- If the worker fails to load, check the network tab for 404s and verify the `workerUrl` is correct.
- If the WASM file fails to load, ensure the `wasmUrl` is correct and the file is accessible from the worker's context.
- For advanced setups (e.g., custom bundlers, frameworks), you may need to adjust the build or server configuration.