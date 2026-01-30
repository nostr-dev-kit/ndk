# Vite Example: cache-sqlite-wasm with Web Worker

This example demonstrates how to use the `cache-sqlite-wasm` library in a Vite application with Web Worker support and OPFS persistence.

## Features

- Runs SQLite operations in a Web Worker using wa-sqlite
- OPFS persistence for incremental writes (no main thread blocking)
- Demonstrates storing and retrieving data using the adapter

## Setup

1. **Install dependencies:**

   ```sh
   bun install
   ```

2. **Run the development server:**

   ```sh
   bun run dev
   ```

3. **Open your browser:**

   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## How it works

- The demo initializes `NDKCacheAdapterSqliteWasm` with:
  - `workerUrl: "/worker.js"`
  - `dbName: "demo-db"`
- The worker script is located in the `public/` directory.
- Click "Store Event" to insert a value into the database, and "Retrieve Event" to fetch it.

## Required Headers

For OPFS persistence to work, the dev server must send these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Configure this in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
```

## Troubleshooting

- If you see errors about missing `worker.js`, ensure it exists in `public/`.
- If persistence isn't working (always in-memory mode), check that COOP/COEP headers are set.
- Open the browser console for logs and error details.

## File Structure

```
example/vite/
  public/
    worker.js         # Web Worker script (built from src/worker.ts)
  src/
    main.ts           # Demo logic
  README.md
  index.html
  vite.config.ts
```

## Building the Worker

Build the worker from the main package:

```sh
cd ../..  # Go to cache-sqlite-wasm root
pnpm run build
cp dist/worker.js example/vite/public/
```

Or use the pre-built worker from the package's dist folder.
