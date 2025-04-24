import type { NDKEvent, NDKEventId } from "./index.js";
import type { NDKRelay } from "../relay/index.js";

let worker: Worker | undefined;

const processingQueue: Record<NDKEventId, { event: NDKEvent; resolves: ((result: boolean) => void)[]; relay?: NDKRelay }> = {};

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

export async function verifySignatureAsync(event: NDKEvent, _persist: boolean, relay?: NDKRelay): Promise<boolean> {
    // Measure total time spent in signature verification
    const ndkInstance = event.ndk!;
    const start = Date.now();

    let result: boolean;
    // Use custom verification if provided
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
