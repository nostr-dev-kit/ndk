import { serializeEvent } from "nostr-tools";
import type { UnsignedEvent } from "nostr-tools";
import type { NDKEvent } from "../index.js";
import Worker from "./pow.worker.js";
import { deserializeEvent, getNonceBounds } from "./Miner";

let worker: Worker;

export type PowMessageData = {
    thread: number;
    threadCount: number;
    status?: string;
    binary: Uint8Array;
    digest?: Uint8Array;
    nonceOffset: number;
    nonceBounds: [number, number];
    nonceStartValue: number;
    nonceEndValue: number;
    currentNonce?: number;
    targetPOW: number;
};

/**
 * Performs proof-of-work (POW) for the NDKEvent replacing the ID field.
 * @param target - The target value for the POW.
 * @returns A Promise that resolves to the updated NDKEvent with the successful nonce tag.
 * @throws Error if the NDK instance is not found, or if the event is missing required properties, or if the event already has an id or a signature.
 */
export async function pow(this: NDKEvent, target: number): Promise<NDKEvent> {
    if (!this.ndk) throw new Error("No NDK instance found!");

    const intTarget = Math.floor(target);

    // check if event has necessary props:
    if (!this.kind) throw new Error("NIP-13: Event has no kind");
    if (!this.created_at) throw new Error("NIP-13: Event has no created_at");
    if (!this.pubkey) throw new Error("NIP-13: Event has no pubkey");
    if (!this.content) console.warn("NIP-13: Event has no content");
    if (intTarget !== target) console.warn("NIP-13: Target is not an integer");

    // can't do POW if these things are already present
    if (this.id) throw new Error("NIP-13: Event already has an id");
    if (this.sig) throw new Error("NIP-13: Event already has a signature");

    // spawn worker
    if (!worker) {
        worker = new Worker();
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _event = this;

    return new Promise((resolve) => {
        // declare handler for worker messages in closure
        function handleMinedPOW(msg: MessageEvent) {
            if (msg.data.status === "pow-target-found") {
                worker.postMessage({ command: "stop" }); // not strictly necessary as the worker stops on its own when the target is found
                const binary = msg.data.binary;
                const eventSerialized = new TextDecoder().decode(binary);
                const raw = deserializeEvent(eventSerialized);
                // copy the successful nonce tag to the event
                _event.tags[0][1] = raw.tags[0][1];

                // resolve promise with the updated event
                resolve(_event);
            }
        }

        // attach handler to worker
        worker.onmessage = handleMinedPOW;

        // add nonce tag to event
        const nonceTagIndex = _event.tags.findIndex((tag) => tag[0] === "nonce");
        if (nonceTagIndex) {
            // remove old nonce tag
            _event.tags.splice(nonceTagIndex, 1);
        }
        // we use unshift so that the nonce tag is first. This is important because we need to know the byte position of the nonce tag in the serialized event, and if any tags come before it which contain multibyte characters, the byte position will be off.
        _event.tags.unshift(["nonce", "0000000000000000", intTarget.toString()]);

        // serialize event
        const serialized = serializeEvent(_event.rawEvent() as UnsignedEvent);

        // get nonce bounds
        const bounds: [number, number] = getNonceBounds(serialized);

        // binary event
        const binary = new TextEncoder().encode(serialized);

        // send event to worker for mining
        worker.postMessage({
            command: "start",
            data: {
                thread: 1,
                threadCount: 1,
                binary,
                nonceOffset: 2 ** 20,
                nonceBounds: bounds,
                nonceStartValue: 0,
                nonceEndValue: 2 ** 20, // ~1 million
                targetPOW: intTarget,
            } as PowMessageData,
        });
    }) as Promise<NDKEvent>;
}
