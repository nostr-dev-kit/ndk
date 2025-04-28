import type { NDKEvent, NDKEventId } from "./index.js";
import type { NDKRelay } from "../relay/index.js";

let worker: Worker | undefined;

const processingQueue: Record<
    NDKEventId,
    { event: NDKEvent; resolves: ((result: boolean) => void)[]; relay?: NDKRelay }
> = {};

export function signatureVerificationInit(w: Worker) {
    worker = w;

    worker.onmessage = (msg: MessageEvent) => {
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
        console.log("[NDK-CORE] Using custom signature verification function async");
        result = await ndkInstance.signatureVerificationFunction(event);
        console.log("Custom signature verification result", event.id, { result });
    } else {
        console.log("Using worker-based signature verification async");
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
