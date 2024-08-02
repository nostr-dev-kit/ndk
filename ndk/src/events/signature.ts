import type { NDKEvent, NDKEventId } from "./index.js";

let worker: Worker | undefined;

const processingQueue: Record<
    NDKEventId,
    { event: NDKEvent; resolves: ((result: boolean) => void)[] }
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

export async function verifySignatureAsync(event: NDKEvent, persist: boolean): Promise<boolean> {
    const promise = new Promise<boolean>((resolve) => {
        const serialized = event.serialize();
        let enqueue = false;
        if (!processingQueue[event.id]) {
            processingQueue[event.id] = { event, resolves: [] };
            enqueue = true;
        }
        processingQueue[event.id].resolves.push(resolve);

        if (!enqueue) return;

        worker!.postMessage({
            serialized,
            id: event.id,
            sig: event.sig,
            pubkey: event.pubkey,
        });
    });

    return promise;
}
