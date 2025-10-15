import type { NDKRelay } from "../relay/index.js";
import type { NDKEvent, NDKEventId } from "./index.js";

let worker: Worker | undefined;

const processingQueue: Record<
    NDKEventId,
    { event: NDKEvent; resolves: ((result: boolean) => void)[]; relay?: NDKRelay }
> = {};

export function signatureVerificationInit(w: Worker) {
    worker = w;

    worker.onmessage = (msg: MessageEvent) => {
        // Validate message format - signature worker sends [eventId, boolean]
        if (!Array.isArray(msg.data) || msg.data.length !== 2) {
            console.error(
                "[NDK] ❌ Signature verification worker received incompatible message format.",
                "\n\n📋 Expected format: [eventId, boolean]",
                "\n📦 Received:",
                msg.data,
                "\n\n🔍 This likely means:",
                "\n  1. You have a STALE worker.js file that needs updating",
                "\n  2. Version mismatch between @nostr-dev-kit/ndk and deployed worker",
                "\n  3. Wrong worker is being used for signature verification",
                "\n\n✅ Solution: Update your worker files:",
                "\n  cp node_modules/@nostr-dev-kit/ndk/dist/workers/sig-verification.js public/",
                "\n  cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/",
                "\n\n💡 Or use Vite/bundler imports instead of static files:",
                '\n  import SigWorker from "@nostr-dev-kit/ndk/workers/sig-verification?worker"',
            );
            return;
        }

        const [eventId, result] = msg.data as [NDKEventId, boolean];

        const record = processingQueue[eventId];

        if (!record) {
            console.error("No record found for event", eventId);
            return;
        }

        delete processingQueue[eventId];

        for (const resolve of record.resolves) {
            resolve(result);
        }
    };
}

/**
 * Verify a signature asynchronously using either a custom function or a worker.
 *
 * This function first checks if a custom verification function is provided in the NDK instance.
 * If available, it uses that function. Otherwise, it falls back to the worker-based verification.
 *
 * @param event The event to verify
 * @param _persist Whether to persist the verification result
 * @param relay The relay that provided the event (optional)
 * @returns A promise that resolves to a boolean indicating if the signature is valid
 */
export async function verifySignatureAsync(event: NDKEvent, _persist: boolean, relay?: NDKRelay): Promise<boolean> {
    // Measure total time spent in signature verification
    const ndkInstance = event.ndk!;
    const start = Date.now();

    let result: boolean;
    // Use custom verification function if provided
    if (ndkInstance.signatureVerificationFunction) {
        result = await ndkInstance.signatureVerificationFunction(event);
    } else {
        // Otherwise use the worker-based verification
        result = await new Promise<boolean>((resolve) => {
            const serialized = event.serialize();
            let enqueue = false;
            if (!processingQueue[event.id]) {
                processingQueue[event.id] = { event, resolves: [], relay };
                enqueue = true;
            }
            processingQueue[event.id].resolves.push(resolve);

            if (!enqueue) return;

            worker?.postMessage({
                serialized,
                id: event.id,
                sig: event.sig,
                pubkey: event.pubkey,
            });
        });
    }

    // Accumulate elapsed time
    ndkInstance.signatureVerificationTimeMs += Date.now() - start;
    return result;
}
