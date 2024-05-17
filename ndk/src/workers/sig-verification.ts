import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

/**
 * This is a web worker that verifies the signature of an event.
 */
globalThis.onmessage = (msg: MessageEvent) => {
    const { serialized, id, sig, pubkey } = msg.data as {
        serialized: string;
        id: string;
        sig: string;
        pubkey: string;
    };

    queueMicrotask(() => {
        const eventHash = sha256(new TextEncoder().encode(serialized));
        const buffer = Buffer.from(id, "hex");
        const idHash = Uint8Array.from(buffer);

        if (!compareTypedArrays(eventHash, idHash)) {
            postMessage([id, false]);
            return;
        }

        const result = schnorr.verify(sig as string, buffer, pubkey);
        postMessage([id, result]);
    });
};

function compareTypedArrays(arr1: Uint8Array, arr2: Uint8Array): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
