import type { NDKEvent } from "./index.js";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { schnorr } from "@noble/curves/secp256k1";

const PUBKEY_REGEX = /^[a-f0-9]{64}$/;

/**
 * Validates an NDKEvent object.
 * @param this - The NDKEvent object to validate.
 * @returns Returns true if the NDKEvent object is valid, otherwise false.
 */
export function validate(this: NDKEvent): boolean {
    if (typeof this.kind !== "number") return false;
    if (typeof this.content !== "string") return false;
    if (typeof this.created_at !== "number") return false;
    if (typeof this.pubkey !== "string") return false;
    if (!this.pubkey.match(PUBKEY_REGEX)) return false;

    if (!Array.isArray(this.tags)) return false;
    for (let i = 0; i < this.tags.length; i++) {
        const tag = this.tags[i];
        if (!Array.isArray(tag)) return false;
        for (let j = 0; j < tag.length; j++) {
            if (typeof tag[j] === "object") return false;
        }
    }

    return true;
}

/**
 * This method verifies the signature of an event and optionally persists the result to the event.
 * @param event {NDKEvent} The event to verify
 * @returns {boolean}
 */
export function verifySignature(this: NDKEvent, persist: boolean): boolean {
    if (typeof this.signatureVerified === "boolean") return this.signatureVerified;

    const hash = this.getEventHash();
    if (hash !== this.id) {
        return persist ? (this.signatureVerified = false) : false;
    }

    try {
        return (this.signatureVerified = schnorr.verify(this.sig as string, hash, this.pubkey));
    } catch (err) {
        return (this.signatureVerified = false);
    }
}

/**
 * This method returns the hash of an event.
 * @param event {NDKEvent} The event to hash
 * @returns {string} Hex encoded sha256 event hash
 */
export function getEventHash(this: NDKEvent): string {
    const eventHash = sha256(new TextEncoder().encode(this.serialize()));
    return bytesToHex(eventHash);
}
