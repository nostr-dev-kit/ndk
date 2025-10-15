import NDK, { NDKEvent, NDKKind, NDKRelaySet, NDKUser, type NDKSigner } from "@nostr-dev-kit/ndk";
import { giftWrap, giftUnwrap } from "@nostr-dev-kit/ndk";
import { getEventHash } from "nostr-tools";
import { ConversationStorage, type StoredMessage } from "./storage.js";

/**
 * Manages NIP-17 Direct Messages using NDK's gift-wrapping functionality.
 *
 * NIP-17 uses a nested encryption approach:
 * 1. Create an unsigned event (rumor) with the actual message (kind 14)
 * 2. Wrap it in a seal (kind 13) - signed by sender, encrypted to recipient
 * 3. Wrap that in a gift wrap (kind 1059) - signed by random key, encrypted to recipient
 *
 * The gift wrap has a randomized created_at timestamp (within 2 days) for privacy.
 */
export class DMManager {
    private ndk: NDK;
    private storage: ConversationStorage;

    constructor(ndk: NDK) {
        this.ndk = ndk;
        this.storage = new ConversationStorage();
    }

    /**
     * Send a NIP-17 direct message to a recipient.
     *
     * @param recipient - The recipient's NDKUser
     * @param messageText - The message content
     * @returns The gift-wrapped event that was published
     */
    async sendDM(recipient: NDKUser, messageText: string): Promise<NDKEvent> {
        if (!this.ndk.signer) {
            throw new Error("NDK signer not configured");
        }

        const sender = await this.ndk.signer.user();

        // Step 1: Create the rumor (unsigned kind 14 event with the message)
        const rumor = new NDKEvent(this.ndk);
        rumor.kind = NDKKind.PrivateDirectMessage; // kind 14
        rumor.content = messageText;
        rumor.created_at = Math.floor(Date.now() / 1000);
        rumor.tags = [["p", recipient.pubkey]];
        // Note: pubkey is now auto-set by giftWrap() if not present

        console.log(`Creating rumor (kind ${rumor.kind})...`);

        // Step 2: Gift wrap the rumor
        // This creates the seal (kind 13) and gift wrap (kind 1059)
        // giftWrap() will automatically set rumor.pubkey and compute its ID
        const wrappedEvent = await giftWrap(rumor, recipient, this.ndk.signer);

        console.log(`Gift wrapped into kind ${wrappedEvent.kind} event`);

        // Step 3: Determine which relays to publish to
        // Per NIP-17, we should publish to BOTH:
        // 1. Recipient's DM relays (so they receive it)
        // 2. Sender's own DM relays (so we can see it in other apps)
        const recipientRelayUrls = await this.getRecipientDMRelays(recipient);
        const senderRelayUrls = await this.getUserDMRelays(sender);

        // Combine and deduplicate relay URLs
        const allRelayUrls = [...new Set([...recipientRelayUrls, ...senderRelayUrls])];

        console.log(`Publishing to ${allRelayUrls.length} relay(s):`, allRelayUrls);

        // Step 4: Publish the gift-wrapped event to both sender and recipient relays
        const relaySet = NDKRelaySet.fromRelayUrls(allRelayUrls, this.ndk);
        const publishedRelays = await wrappedEvent.publish(relaySet);

        console.log(`Published to ${publishedRelays.size} relay(s)`);

        // Step 5: Store the message locally for our records
        // Note: giftWrap() has already set rumor.pubkey automatically
        // We need to compute the ID for storage (giftWrap computes it internally but doesn't expose it)
        const rumorEvent = rumor.rawEvent();
        if (!rumorEvent.id) {
            rumorEvent.id = getEventHash(rumorEvent);
        }

        this.storage.addMessage({
            id: rumorEvent.id,
            sender: sender.pubkey,
            recipient: recipient.pubkey,
            content: messageText,
            created_at: rumor.created_at!,
            read: true, // We sent it, so mark as read
            rumor: rumorEvent,
        });

        return wrappedEvent;
    }

    /**
     * Subscribe to incoming DMs for the current user.
     * Automatically unwraps and stores messages as they arrive.
     * Per NIP-17, subscribes to the user's DM relays (kind 10050).
     */
    async subscribeToDMs(onMessage?: (message: StoredMessage) => void): Promise<void> {
        if (!this.ndk.signer) {
            throw new Error("NDK signer not configured");
        }

        const user = await this.ndk.signer.user();

        console.log(`Subscribing to DMs for ${user.npub}...`);

        // Get the user's DM relays (kind 10050)
        const userRelayUrls = await this.getUserDMRelays(user);
        console.log(`Subscribing to ${userRelayUrls.length} relay(s):`, userRelayUrls);

        // Create a relay set targeting the user's DM relays
        const relaySet = NDKRelaySet.fromRelayUrls(userRelayUrls, this.ndk);

        // Subscribe to gift-wrapped events (kind 1059) tagged with our pubkey
        const sub = this.ndk.subscribe(
            {
                kinds: [NDKKind.GiftWrap], // kind 1059
                "#p": [user.pubkey],
            },
            {
                closeOnEose: false, // Keep subscription open for real-time updates
                relaySet, // Subscribe only to user's DM relays
            },
        );

        sub.on("event", async (wrappedEvent: NDKEvent) => {
            try {
                console.log(`Received gift wrap event ${wrappedEvent.id}`);

                // Unwrap the gift wrap to get the rumor
                const rumor = await giftUnwrap(wrappedEvent, undefined, this.ndk.signer);

                console.log(`Unwrapped to kind ${rumor.kind} event from ${rumor.pubkey}`);

                // Verify it's a kind 14 (PrivateDirectMessage)
                if (rumor.kind !== NDKKind.PrivateDirectMessage) {
                    console.log(`Ignoring non-DM event (kind ${rumor.kind})`);
                    return;
                }

                // Extract the sender from the rumor
                const sender = rumor.pubkey;
                const recipient = user.pubkey;

                // Store the message
                const storedMessage: StoredMessage = {
                    id: rumor.id,
                    sender,
                    recipient,
                    content: rumor.content,
                    created_at: rumor.created_at!,
                    read: false,
                    rumor: rumor.rawEvent(),
                };

                this.storage.addMessage(storedMessage);
                console.log(`Stored message from ${sender.slice(0, 8)}...`);

                // Call the callback if provided
                if (onMessage) {
                    onMessage(storedMessage);
                }
            } catch (error) {
                console.error("Failed to unwrap gift wrap:", error);
            }
        });

        sub.on("eose", () => {
            console.log("Subscription active - listening for new messages...");
        });
    }

    /**
     * Get all conversations for the current user.
     */
    async getConversations(): Promise<Map<string, StoredMessage[]>> {
        if (!this.ndk.signer) {
            throw new Error("NDK signer not configured");
        }

        const user = await this.ndk.signer.user();
        return this.storage.getAllConversations(user.pubkey);
    }

    /**
     * Get a specific conversation with another user.
     */
    async getConversation(otherPubkey: string): Promise<StoredMessage[]> {
        if (!this.ndk.signer) {
            throw new Error("NDK signer not configured");
        }

        const user = await this.ndk.signer.user();
        return this.storage.getConversation(user.pubkey, otherPubkey);
    }

    /**
     * Mark messages as read.
     */
    markAsRead(messageIds: string[]): void {
        this.storage.markAsRead(messageIds);
    }

    /**
     * Get the DM relays for a recipient (kind 10050).
     * Falls back to the recipient's general relay list if not found.
     */
    private async getRecipientDMRelays(recipient: NDKUser): Promise<string[]> {
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

            // Last resort: use NDK's connected relays
            return Array.from(this.ndk.pool.relays.keys()).slice(0, 3);
        } catch (error) {
            console.error("Failed to fetch recipient relays:", error);
            return Array.from(this.ndk.pool.relays.keys()).slice(0, 3);
        }
    }

    /**
     * Get the DM relays for the current user (kind 10050).
     * Falls back to the user's general relay list if not found.
     */
    private async getUserDMRelays(user: NDKUser): Promise<string[]> {
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

            // Last resort: use NDK's connected relays
            return Array.from(this.ndk.pool.relays.keys()).slice(0, 3);
        } catch (error) {
            console.error("Failed to fetch user relays:", error);
            return Array.from(this.ndk.pool.relays.keys()).slice(0, 3);
        }
    }

    /**
     * Publish the current user's DM relay list (kind 10050).
     */
    async publishDMRelayList(relays: string[]): Promise<NDKEvent> {
        if (!this.ndk.signer) {
            throw new Error("NDK signer not configured");
        }

        const event = new NDKEvent(this.ndk);
        event.kind = NDKKind.DirectMessageReceiveRelayList; // kind 10050
        event.tags = relays.map((relay) => ["relay", relay]);
        event.created_at = Math.floor(Date.now() / 1000);

        await event.sign(this.ndk.signer);
        await event.publish();

        console.log(`Published DM relay list with ${relays.length} relay(s)`);

        return event;
    }
}
