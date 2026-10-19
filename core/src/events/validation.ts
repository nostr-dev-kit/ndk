import { schnorr } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { LRUCache } from "typescript-lru-cache";
import type { NDKEvent, NostrEvent } from ".";
import { verifySignatureAsync } from "./signature";

const PUBKEY_REGEX = /^[a-f0-9]{64}$/;
const SIG_REGEX = /^[a-f0-9]{128}$/;

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
 * Signatures already verified, by event id: the id maps to the signature that
 * was found valid for it.
 *
 * An entry is only written once the id has been checked to be the hash of the
 * event, so the same id always means the same author, time, kind, tags and
 * content, and an entry is only used for the same signature. Failures are not
 * remembered: a bad signature under an event's id must not count against the
 * genuine event.
 */
export const verifiedSignatures = new LRUCache<string, string>({
    maxSize: 1000,
    entryExpirationTimeInMS: 60000,
});

/**
 * This method verifies the signature of an event and optionally persists the result to the event.
 *
 * An event whose id is not the hash of its contents is invalid, whatever its signature.
 *
 * @param event {NDKEvent} The event to verify
 * @returns {boolean | undefined} True if the signature is valid, false if it is invalid, and undefined if the signature has not been verified yet.
 */
export function verifySignature(this: NDKEvent, persist: boolean): boolean | undefined {
    if (typeof this.signatureVerified === "boolean") return this.signatureVerified;

    // A signature that is not 64 bytes of hex can never verify (and would make
    // the worker throw instead of answering).
    if (typeof this.sig !== "string" || !SIG_REGEX.test(this.sig)) {
        this.signatureVerified = false;
        return false;
    }

    try {
        // The signature is over the id, and the cache below is keyed by it: check
        // that the id is this event's before trusting either.
        const hash = sha256(new TextEncoder().encode(this.serialize()));
        if (bytesToHex(hash) !== this.id) {
            this.signatureVerified = false;
            return false;
        }

        const prevVerification = verifiedSignatures.get(this.id);
        if (prevVerification !== null && prevVerification === this.sig) {
            this.signatureVerified = true;
            return true;
        }

        // Use async verification if enabled (either via worker or custom function)
        if (this.ndk?.asyncSigVerification) {
            // Capture the relay in a closure before the async call
            const relayForVerification = this.relay;

            // verifySignatureAsync will use either the custom function or the worker
            verifySignatureAsync(this, persist, relayForVerification)
                .then((result) => {
                    if (persist) {
                        this.signatureVerified = result;
                        if (result) verifiedSignatures.set(this.id, this.sig!);
                    }

                    if (!result) {
                        if (relayForVerification) {
                            this.ndk?.reportInvalidSignature(this, relayForVerification);
                        } else {
                            this.ndk?.reportInvalidSignature(this);
                        }
                    } else {
                        // Track successful validation
                        if (relayForVerification) {
                            relayForVerification.addValidatedEvent();
                        }
                    }
                })
                .catch((err) => {
                    console.error("signature verification error", this.id, err);
                });
        } else {
            const sigBytes = hexToBytes(this.sig as string);
            const pubkeyBytes = hexToBytes(this.pubkey);
            const res = schnorr.verify(sigBytes, hash, pubkeyBytes);
            if (res) verifiedSignatures.set(this.id, this.sig!);
            this.signatureVerified = res;
            return res;
        }
    } catch (_err) {
        this.signatureVerified = false;
        return false;
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
