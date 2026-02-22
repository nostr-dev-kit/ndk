/** biome-ignore-all lint/complexity/noStaticOnlyClass: <test purposes> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <test purposes> */

import { EncryptedDirectMessage, Repost, ShortTextNote } from "nostr-tools/kinds";
import type NDK from "../../src";
import { NDKEvent, NDKPrivateKeySigner } from "../../src";

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
    private static ndk: NDK | null = null;

    static setNDK(ndk: NDK): void {
        EventGenerator.ndk = ndk;

        // Check if the NDK instance has a signer, if not create one
        if (!ndk.signer) {
            ndk.signer = NDKPrivateKeySigner.generate();
        }
    }

    static createEvent(kind = ShortTextNote, content = "", pubkey?: string): NDKEvent {
        const ndk = EventGenerator.requireNDK();
        const event = new NDKEvent(ndk);
        event.kind = kind;
        event.pubkey = EventGenerator.resolvePubkey(pubkey);
        event.content = content;

        return event;
    }

    static async createSignedTextNote(content: string, pubkey?: string): Promise<NDKEvent> {
        const event = EventGenerator.createEvent(ShortTextNote, content, pubkey);

        await event.sign();

        return event;
    }

    static async createEncryptedDirectMessage(content: string, from: string, to: string): Promise<NDKEvent> {
        const event = EventGenerator.createEvent(EncryptedDirectMessage, content, from);
        event.tags.push(["p", to]);

        await event.sign();

        return event;
    }

    static async createRepost(originalEvent: NDKEvent, pubkey?: string): Promise<NDKEvent> {
        const event = EventGenerator.createEvent(Repost, JSON.stringify(await originalEvent.toNostrEvent()), pubkey);
        event.tags.push(["e", originalEvent.id || ""]);
        event.tags.push(["p", originalEvent.pubkey]);

        await event.sign();

        return event;
    }

    static async createParameterizedReplaceable(
        kind: number,
        content: string,
        pubkey?: string,
        dTag = "",
    ): Promise<NDKEvent> {
        if (kind < 30000 || kind > 39999) {
            throw new Error(`Invalid parameterized replaceable event kind: ${kind}. Must be between 30000-39999.`);
        }

        const event = EventGenerator.createEvent(kind, content, pubkey);

        // Parameterized replaceable events require a d tag
        event.tags.push(["d", dTag]);

        await event.sign();

        return event;
    }

    private static requireNDK() {
        if (!EventGenerator.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }
        return EventGenerator.ndk;
    }

    private static resolvePubkey(pubkey?: string): string {
        if (pubkey && pubkey.length > 0) return pubkey;
        return NDKPrivateKeySigner.generate().pubkey;
    }
}
