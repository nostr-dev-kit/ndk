import type { NDKEvent, NostrEvent } from ".";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { schnorr } from "@noble/curves/secp256k1";
import { verifySignatureAsync } from "./signature";
import { LRUCache } from "typescript-lru-cache";

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

export const verifiedSignatures = new LRUCache<string, false | string>({
    maxSize: 1000,
    entryExpirationTimeInMS: 60000,
});

/**
 * This method verifies the signature of an event and optionally persists the result to the event.
 * @param event {NDKEvent} The event to verify
 * @returns {boolean | undefined} True if the signature is valid, false if it is invalid, and undefined if the signature has not been verified yet.
 */
export function verifySignature(this: NDKEvent, persist: boolean): boolean | undefined {
    if (typeof this.signatureVerified === "boolean") return this.signatureVerified;

    const prevVerification = verifiedSignatures.get(this.id);
    if (prevVerification !== null) {
        return (this.signatureVerified = !!prevVerification);
    }

    try {
        if (this.ndk?.asyncSigVerification) {
            verifySignatureAsync(this, persist).then((result) => {
                if (persist) {
                    this.signatureVerified = result;
                    if (result) verifiedSignatures.set(this.id, this.sig!);
                }

                if (!result) {
                    this.ndk!.emit("event:invalid-sig", this);
                    verifiedSignatures.set(this.id, false);
                }
            });
        } else {
            const hash = sha256(new TextEncoder().encode(this.serialize()));
            const res = schnorr.verify(this.sig as string, hash, this.pubkey);
            if (res) verifiedSignatures.set(this.id, this.sig!);
            else verifiedSignatures.set(this.id, false);
            return (this.signatureVerified = res);
        }
    } catch (err) {
        return (this.signatureVerified = false);
    }
}

/**
 * This method returns the hash of an event.
 * @param event {NDKEvent} The event to hash
 * @param serialized {string} The serialized event
 * @returns {string} Hex encoded sha256 event hash
 */
export function getEventHash(this: NDKEvent): string {
    return getEventHashFromSerializedEvent(this.serialize());
}

export function getEventHashFromSerializedEvent(serializedEvent: string): string {
    const eventHash = sha256(new TextEncoder().encode(serializedEvent));
    return bytesToHex(eventHash);
}
