import { NDKEvent } from "../../src/events";
import { NDKPrivateKeySigner } from "../../src/signers/private-key";

/**
 * Low-level event generator for creating test events in your Nostr application tests.
 *
 * Provides simple methods to create various types of Nostr events with automatic signing.
 * Must call `setNDK()` once before using any event creation methods.
 *
 * @example
 * ```typescript
 * import { EventGenerator, UserGenerator } from '@nostr-dev-kit/ndk/test';
 *
 * // Initialize once in your test setup
 * EventGenerator.setNDK(ndk);
 *
 * // Create events
 * const alice = await UserGenerator.getUser('alice', ndk);
 * const note = await EventGenerator.createSignedTextNote('Hello!', alice.pubkey);
 * const dm = await EventGenerator.createEncryptedDirectMessage('Secret', alice.pubkey, bob.pubkey);
 *
 * // Use these events to test your app's event handling
 * ```
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
            const signer = NDKPrivateKeySigner.generate();
            const hexPrivateKey = signer.privateKey;
            const generatedPubkey = signer.pubkey;

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
            const signer = NDKPrivateKeySigner.generate();
            pubkey = signer.pubkey;
        }

        const event = new NDKEvent(EventGenerator.ndk);
        event.kind = kind;
        event.pubkey = pubkey;
        event.content = content;

        return event;
    }

    static async createSignedTextNote(content: string, pubkey = ""): Promise<NDKEvent> {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const signer = NDKPrivateKeySigner.generate();
            pubkey = signer.pubkey;
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
            const signer = NDKPrivateKeySigner.generate();
            pubkey = signer.pubkey;
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
            const signer = NDKPrivateKeySigner.generate();
            pubkey = signer.pubkey;
        }

        const event = EventGenerator.createEvent(kind, content, pubkey);

        // Parameterized replaceable events require a d tag
        event.tags.push(["d", dTag]);

        // Sign the event
        await event.sign();

        return event;
    }
}
