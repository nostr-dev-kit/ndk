import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import * as nostrTools from "nostr-tools";

/**
 * EventGenerator for testing purposes
 *
 * This utility helps generate test events for the NDK testing infrastructure.
 * It handles private key generation and event creation with proper signing.
 */
export class EventGenerator {
    private static privateKeys = new Map<string, string>();
    private static ndk: any = null;

    static setNDK(ndk: any): void {
        EventGenerator.ndk = ndk;

        // Check if the NDK instance has a signer, if not create one
        if (!ndk.signer) {
            ndk.signer = NDKPrivateKeySigner.generate();
        }
    }

    static getPrivateKeyForPubkey(pubkey: string): string {
        if (!EventGenerator.privateKeys.has(pubkey)) {
            // Using the core functions from nostr-tools
            const privateKey = nostrTools.generateSecretKey();
            const hexPrivateKey = Buffer.from(privateKey).toString("hex");
            const generatedPubkey = nostrTools.getPublicKey(privateKey);

            // If this is a randomly generated pubkey, associate it
            if (!pubkey || pubkey === generatedPubkey) {
                EventGenerator.privateKeys.set(generatedPubkey, hexPrivateKey);
                return hexPrivateKey;
            }

            // Otherwise, we need to create a mapping for the specific pubkey
            // (This is just for testing - in real world the private key would need to match)
            EventGenerator.privateKeys.set(pubkey, hexPrivateKey);
        }
        return EventGenerator.privateKeys.get(pubkey) || "";
    }

    static createEvent(
        kind = 1, // text note
        content = "",
        pubkey = "",
    ): NDKEvent {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const event = new NDKEvent(EventGenerator.ndk);
        event.kind = kind;
        event.pubkey = pubkey;
        event.content = content;
        event.created_at = Math.floor(Date.now() / 1000);

        return event;
    }

    static async createSignedTextNote(content: string, pubkey = ""): Promise<NDKEvent> {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const _privateKey = EventGenerator.getPrivateKeyForPubkey(pubkey);
        const event = EventGenerator.createEvent(1, content, pubkey);

        // Sign the event using NDK's signing mechanism
        await event.sign();

        return event;
    }

    static async createEncryptedDirectMessage(content: string, from: string, to: string): Promise<NDKEvent> {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        const event = EventGenerator.createEvent(4, content, from);
        event.tags.push(["p", to]);

        // Sign the event
        await event.sign();

        return event;
    }

    static async createRepost(originalEvent: NDKEvent, pubkey = ""): Promise<NDKEvent> {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const event = EventGenerator.createEvent(
            6, // Repost kind
            JSON.stringify(await originalEvent.toNostrEvent()),
            pubkey,
        );
        event.tags.push(["e", originalEvent.id || ""]);
        event.tags.push(["p", originalEvent.pubkey]);

        // Sign the event
        await event.sign();

        return event;
    }

    static async createParameterizedReplaceable(
        kind: number,
        content: string,
        pubkey = "",
        dTag = "",
    ): Promise<NDKEvent> {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (kind < 30000 || kind > 39999) {
            throw new Error(`Invalid parameterized replaceable event kind: ${kind}. Must be between 30000-39999.`);
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const event = EventGenerator.createEvent(kind, content, pubkey);

        // Parameterized replaceable events require a d tag
        event.tags.push(["d", dTag]);

        // Sign the event
        await event.sign();

        return event;
    }
}
