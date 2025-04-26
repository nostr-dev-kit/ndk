# Vite Example: ndk-cache-sqlite-wasm with Web Worker

This example demonstrates how to use the `ndk-cache-sqlite-wasm` library in a Vite application with Web Worker support.

## Features

- Runs SQLite operations in a Web Worker for responsive UI
- Demonstrates storing and retrieving data using the adapter
- Shows how to configure Vite to serve the worker and WASM files

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
  - `useWorker: true`
  - `workerUrl: "/worker.js"`
  - `wasmUrl: "/sql-wasm.wasm"`
- The worker script and WASM file are located in the `public/` directory.
- Click "Store Value" to insert a value into the database, and "Retrieve Value" to fetch it.

## Troubleshooting

- If you see errors about missing `worker.js` or `sql-wasm.wasm`, ensure both files exist in `public/`.
- All database operations are asynchronous in worker mode.
- Open the browser console for logs and error details.

## File Structure

```
example/vite/
  public/
    worker.js         # Web Worker script (built from src/worker.ts)
    sql-wasm.wasm     # SQLite WASM binary
  src/
    main.ts           # Demo logic
    ndk-cache-sqlite-wasm-shim.d.ts # TypeScript shim for local dev
  README.md
  index.html
  ...
```

## Notes

- This example assumes you have built `worker.js` from your local `src/worker.ts` using Bun:

  ```sh
  bun build ../../src/worker.ts --outfile ./public/worker.js --format esm --target browser
  ```

- The adapter import assumes the package is available as `@nostr-dev-kit/ndk-cache-sqlite-wasm`. Adjust the import path if using a local build.