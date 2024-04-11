import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

/**
 * This is a web worker that verifies the signature of an event.
 */
globalThis.onmessage = (msg: MessageEvent) => {
    const { serialized, id, sig, pubkey } = msg.data as { serialized: string, id: string, sig: string, pubkey: string };

    queueMicrotask(() => {
        const eventHash = sha256(new TextEncoder().encode(serialized));
        const hash = bytesToHex(eventHash);

        if (hash !== id) {
            postMessage([ id, false ]);
            return;
        }

        const result = schnorr.verify(sig as string, hash, pubkey);
        postMessage([ id, result ]);
    });
}
