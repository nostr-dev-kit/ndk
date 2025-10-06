import "./style.css";

import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/ndk-cache-sqlite-wasm";

const ndk = new NDK();

// Minimal Nostr event structure for demo
function createDemoEvent(value: string) {
    const now = Math.floor(Date.now() / 1000);
    const event = new NDKEvent(ndk, {
        id: crypto.randomUUID(),
        pubkey: "demo-pubkey",
        created_at: now,
        kind: 1,
        tags: [],
        content: value,
        sig: "demo-sig",
    });
    return event;
}

let lastEventId: string | null = null;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>NDK Cache SQLite WASM + Web Worker Demo</h1>
    <div class="card">
      <button id="store" type="button">Store Event</button>
      <button id="retrieve" type="button">Retrieve Event</button>
      <div id="result" style="margin-top:1em;color:#333"></div>
    </div>
    <p class="read-the-docs">
      This demo uses <code>ndk-cache-sqlite-wasm</code> in Web Worker mode via Vite.<br>
      Open the console to see logs and errors.
    </p>
  </div>
`;

// Add console logs to verify Web Worker usage
console.log("Creating adapter with Web Worker mode enabled");
const adapter = new NDKCacheAdapterSqliteWasm({
    dbName: "demo-db",
    useWorker: true,
    workerUrl: "/worker.js",
    wasmUrl: "/sql-wasm.wasm",
});
console.log("Adapter created, useWorker property:", adapter.useWorker);
// Inspect the adapter object to see its properties
console.log("Adapter object:", Object.getOwnPropertyNames(adapter));
// Check if the worker property exists (should be private)
console.log(
    "Adapter has worker property:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(adapter)).includes("worker"),
);

async function init() {
    const resultDiv = document.getElementById("result")!;
    resultDiv.textContent = "Initializing database...";
    try {
        console.log("Initializing adapter...");
        await adapter.initializeAsync();
        console.log("Adapter initialized successfully");
        resultDiv.textContent = "Database initialized. Ready!";
    } catch (e) {
        console.error("Failed to initialize adapter:", e);
        resultDiv.textContent = "Failed to initialize: " + (e as Error).message;
        throw e;
    }
}

document.getElementById("store")!.onclick = async () => {
    const resultDiv = document.getElementById("result")!;
    resultDiv.textContent = "Storing event...";
    try {
        const event = createDemoEvent("bar-" + Date.now());
        console.log("Storing event:", event.id);
        // setEvent(event, filters) - filters should be an array, not an object
        await adapter.setEvent(event, [{}]);
        console.log("Event stored successfully");
        lastEventId = event.id;
        resultDiv.textContent = `Event stored! ID: ${event.id}`;
    } catch (e) {
        console.error("Error storing event:", e);
        resultDiv.textContent = "Error storing event: " + (e as Error).message;
    }
};

document.getElementById("retrieve")!.onclick = async () => {
    const resultDiv = document.getElementById("result")!;
    if (!lastEventId) {
        resultDiv.textContent = "No event stored yet. Please store an event first.";
        return;
    }
    resultDiv.textContent = "Retrieving event...";
    try {
        console.log("Retrieving event:", lastEventId);
        // getEvent only takes an id parameter, not a filter
        const event = await adapter.getEvent(lastEventId);
        console.log("Event retrieved:", event ? "success" : "not found", event);
        if (event) {
            resultDiv.textContent = `Retrieved event: ${JSON.stringify(event, null, 2)}`;
        } else {
            resultDiv.textContent = "No event found for last stored ID.";
        }
    } catch (e) {
        console.error("Error retrieving event:", e);
        resultDiv.textContent = "Error retrieving event: " + (e as Error).message;
    }
};

init();
