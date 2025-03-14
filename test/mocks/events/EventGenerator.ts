import NDK, { NDKEvent, NDKKind } from "../../../ndk/src";
import { NDKPrivateKeySigner } from "../../../ndk/src/signers/private-key";

// Since we're using a pnpm monorepo, we need to handle the nostr-tools import carefully
// The pure subpath is being used to avoid WebCrypto dependencies
import * as nostrTools from "nostr-tools";

/**
 * EventGenerator for testing purposes
 *
 * This utility helps generate test events for the NDK testing infrastructure.
 * It handles private key generation and event creation with proper signing.
 */
export class EventGenerator {
    private static privateKeys = new Map<string, string>();
    private static ndk: NDK | null = null;

    static setNDK(ndk: NDK): void {
        this.ndk = ndk;
    }

    static getPrivateKeyForPubkey(pubkey: string): string {
        if (!this.privateKeys.has(pubkey)) {
            // Using the core functions from nostr-tools
            const privateKey = nostrTools.generateSecretKey();
            const hexPrivateKey = Buffer.from(privateKey).toString("hex");
            const generatedPubkey = nostrTools.getPublicKey(privateKey);

            // If this is a randomly generated pubkey, associate it
            if (!pubkey || pubkey === generatedPubkey) {
                this.privateKeys.set(generatedPubkey, hexPrivateKey);
                return hexPrivateKey;
            }

            // Otherwise, we need to create a mapping for the specific pubkey
            // (This is just for testing - in real world the private key would need to match)
            this.privateKeys.set(pubkey, hexPrivateKey);
        }
        return this.privateKeys.get(pubkey) || "";
    }

    static createEvent(
        kind: number = NDKKind.Text,
        content: string = "",
        pubkey: string = ""
    ): NDKEvent {
        if (!this.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const event = new NDKEvent(this.ndk);
        event.kind = kind;
        event.pubkey = pubkey;
        event.content = content;
        event.created_at = Math.floor(Date.now() / 1000);

        return event;
    }

    static async createSignedTextNote(content: string, pubkey: string = ""): Promise<NDKEvent> {
        if (!this.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const privateKey = this.getPrivateKeyForPubkey(pubkey);
        const event = this.createEvent(NDKKind.Text, content, pubkey);

        // Create a signer and sign the event
        const signer = new NDKPrivateKeySigner(privateKey);
        await event.sign(signer);

        return event;
    }

    static async createEncryptedDirectMessage(
        content: string,
        from: string,
        to: string
    ): Promise<NDKEvent> {
        if (!this.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        const fromPrivateKey = this.getPrivateKeyForPubkey(from);

        const event = this.createEvent(NDKKind.EncryptedDirectMessage, content, from);
        event.tags.push(["p", to]);

        // Create a signer and sign the event
        const signer = new NDKPrivateKeySigner(fromPrivateKey);
        await event.sign(signer);

        return event;
    }

    static async createRepost(originalEvent: NDKEvent, pubkey: string = ""): Promise<NDKEvent> {
        if (!this.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const privateKey = this.getPrivateKeyForPubkey(pubkey);

        const event = this.createEvent(
            NDKKind.Repost,
            JSON.stringify(originalEvent.rawEvent()),
            pubkey
        );
        event.tags.push(["e", originalEvent.id || ""]);
        event.tags.push(["p", originalEvent.pubkey]);

        // Create a signer and sign the event
        const signer = new NDKPrivateKeySigner(privateKey);
        await event.sign(signer);

        return event;
    }

    static async createParameterizedReplaceable(
        kind: number,
        content: string,
        pubkey: string = "",
        dTag: string = ""
    ): Promise<NDKEvent> {
        if (!this.ndk) {
            throw new Error("NDK not set in EventGenerator. Call setNDK first.");
        }

        if (kind < 30000 || kind > 39999) {
            throw new Error(
                `Invalid parameterized replaceable event kind: ${kind}. Must be between 30000-39999.`
            );
        }

        if (!pubkey) {
            const secretKey = nostrTools.generateSecretKey();
            pubkey = nostrTools.getPublicKey(secretKey);
        }

        const privateKey = this.getPrivateKeyForPubkey(pubkey);

        const event = this.createEvent(kind, content, pubkey);

        // Parameterized replaceable events require a d tag
        event.tags.push(["d", dTag]);

        // Create a signer and sign the event
        const signer = new NDKPrivateKeySigner(privateKey);
        await event.sign(signer);

        return event;
    }
}
