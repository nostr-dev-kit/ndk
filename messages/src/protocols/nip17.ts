import type NDK from "@nostr-dev-kit/ndk";
import {
    giftUnwrap,
    giftWrap,
    NDKEvent,
    NDKKind,
    NDKRelaySet,
    type NDKSigner,
    NDKUser,
    type NostrEvent,
} from "@nostr-dev-kit/ndk";
import { getEventHash } from "nostr-tools/pure";
import type { NDKMessage } from "../types";

/**
 * NIP-17 Protocol Handler
 * Handles gift-wrapped private direct messages
 */
export class NIP17Protocol {
    constructor(
        private ndk: NDK,
        private signer: NDKSigner,
    ) {}

    /**
     * Send a NIP-17 direct message
     */
    async sendMessage(recipient: NDKUser, content: string): Promise<NDKEvent> {
        const sender = await this.signer.user();

        // Create the rumor (unsigned kind 14 event)
        const rumor = new NDKEvent(this.ndk);
        rumor.kind = NDKKind.PrivateDirectMessage;
        rumor.content = content;
        rumor.created_at = Math.floor(Date.now() / 1000);
        rumor.pubkey = sender.pubkey; // Must set pubkey for rumor
        rumor.tags = [["p", recipient.pubkey]];

        // Gift wrap the rumor
        const wrappedEvent = await giftWrap(rumor, recipient, this.signer);

        // Get relay URLs for both sender and recipient
        const recipientRelays = await this.getRecipientDMRelays(recipient);
        const senderRelays = await this.getUserDMRelays(sender);

        // Combine and deduplicate
        const allRelays = [...new Set([...recipientRelays, ...senderRelays])];

        // Publish to relays
        if (allRelays.length > 0) {
            const relaySet = NDKRelaySet.fromRelayUrls(allRelays, this.ndk);
            await wrappedEvent.publish(relaySet);
        } else {
            // Fallback to all connected relays
            await wrappedEvent.publish();
        }

        return wrappedEvent;
    }

    /**
     * Unwrap a received gift-wrapped message
     */
    async unwrapMessage(wrappedEvent: NDKEvent): Promise<NostrEvent | null> {
        try {
            const rumor = await giftUnwrap(wrappedEvent, undefined, this.signer);

            // Verify it's a kind 14 message
            if (rumor.kind !== NDKKind.PrivateDirectMessage) {
                return null;
            }

            return rumor.rawEvent();
        } catch (error) {
            console.error("Failed to unwrap message:", error);
            return null;
        }
    }

    /**
     * Convert a rumor event to NDKMessage format
     */
    rumorToMessage(rumor: NostrEvent, myPubkey: string): NDKMessage {
        // Compute ID if not present
        if (!rumor.id) {
            rumor.id = getEventHash({
                ...rumor,
                kind: rumor.kind ?? 0,
                created_at: rumor.created_at ?? 0,
                tags: rumor.tags ?? [],
                content: rumor.content ?? "",
                pubkey: rumor.pubkey ?? "",
            });
        }

        // Determine if this is incoming or outgoing
        const isOutgoing = rumor.pubkey === myPubkey;
        const otherPubkey = isOutgoing ? rumor.tags.find((t) => t[0] === "p")?.[1] || "" : rumor.pubkey;

        // Create conversation ID (sorted pubkeys for consistency)
        const conversationId = [myPubkey, otherPubkey].sort().join(":");

        return {
            id: rumor.id || "",
            content: rumor.content || "",
            sender: new NDKUser({ pubkey: rumor.pubkey }),
            recipient: isOutgoing ? new NDKUser({ pubkey: otherPubkey }) : new NDKUser({ pubkey: myPubkey }),
            timestamp: rumor.created_at || Math.floor(Date.now() / 1000),
            protocol: "nip17",
            read: isOutgoing, // Outgoing messages are automatically "read"
            rumor,
            conversationId,
        };
    }

    /**
     * Get DM relays for a recipient (kind 10050)
     */
    async getRecipientDMRelays(recipient: NDKUser): Promise<string[]> {
        try {
            // Try to fetch the recipient's DM relay list (kind 10050)
            const dmRelayList = await this.ndk.fetchEvent({
                kinds: [NDKKind.DirectMessageReceiveRelayList],
                authors: [recipient.pubkey],
            });

            if (dmRelayList) {
                const relays = dmRelayList.getMatchingTags("relay").map((t) => t[1]);
                if (relays.length > 0) {
                    return relays;
                }
            }

            // Fallback to general relay list (kind 10002)
            const relayList = await this.ndk.fetchEvent({
                kinds: [10002],
                authors: [recipient.pubkey],
            });

            if (relayList) {
                const relays = relayList.getMatchingTags("r").map((t) => t[1]);
                if (relays.length > 0) {
                    return relays.slice(0, 3); // Use first 3 relays
                }
            }

            return [];
        } catch (error) {
            console.error("Failed to fetch recipient relays:", error);
            return [];
        }
    }

    /**
     * Get DM relays for the current user (kind 10050)
     */
    async getUserDMRelays(user: NDKUser): Promise<string[]> {
        try {
            // Try to fetch the user's DM relay list (kind 10050)
            const dmRelayList = await this.ndk.fetchEvent({
                kinds: [NDKKind.DirectMessageReceiveRelayList],
                authors: [user.pubkey],
            });

            if (dmRelayList) {
                const relays = dmRelayList.getMatchingTags("relay").map((t) => t[1]);
                if (relays.length > 0) {
                    return relays;
                }
            }

            // Fallback to general relay list (kind 10002)
            const relayList = await this.ndk.fetchEvent({
                kinds: [10002],
                authors: [user.pubkey],
            });

            if (relayList) {
                const relays = relayList.getMatchingTags("r").map((t) => t[1]);
                if (relays.length > 0) {
                    return relays.slice(0, 3); // Use first 3 relays
                }
            }

            return [];
        } catch (error) {
            console.error("Failed to fetch user relays:", error);
            return [];
        }
    }

    /**
     * Publish the user's DM relay list (kind 10050)
     */
    async publishDMRelayList(relays: string[]): Promise<NDKEvent> {
        const event = new NDKEvent(this.ndk);
        event.kind = NDKKind.DirectMessageReceiveRelayList;
        event.tags = relays.map((relay) => ["relay", relay]);
        event.created_at = Math.floor(Date.now() / 1000);

        await event.sign(this.signer);
        await event.publish();

        return event;
    }
}
