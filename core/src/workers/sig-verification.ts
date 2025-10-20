import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

// Protocol version for signature verification worker
// Format: [major, minor, patch] matching @nostr-dev-kit/ndk package version
const PROTOCOL_VERSION = "2.17.5";
const PROTOCOL_NAME = "ndk-sig-verify";

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
        const idHash = hexToBytes(id);

        if (!compareTypedArrays(eventHash, idHash)) {
            postMessage([id, false]);
            return;
        }

        const result = schnorr.verify(sig as string, idHash, pubkey);
        postMessage([id, result]);
    });
};

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

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
