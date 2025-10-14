import { EventEmitter } from "eventemitter3";
import NDK, { NDKEvent, NDKKind, NDKRelaySet, NDKSubscription, NDKUser } from "@nostr-dev-kit/ndk";
import { giftUnwrap } from "@nostr-dev-kit/ndk";
import { NDKConversation } from "./conversation";
import { NIP17Protocol } from "./protocols/nip17";
import { MemoryAdapter } from "./storage/memory";
import type {
    MessengerOptions,
    StorageAdapter,
    NDKMessage,
    ConversationMeta,
    ErrorEvent
} from "./types";

/**
 * Main orchestrator class for messaging functionality.
 * Manages conversations, handles incoming messages, and coordinates protocols.
 */
export class NDKMessenger extends EventEmitter {
    ndk: NDK;
    private storage: StorageAdapter;
    private nip17: NIP17Protocol;
    private conversations: Map<string, NDKConversation> = new Map();
    private subscription?: NDKSubscription;
    myPubkey?: string;
    private started = false;

    constructor(ndk: NDK, options?: MessengerOptions) {
        super();
        this.ndk = ndk;
        this.storage = options?.storage || new MemoryAdapter();

        if (!ndk.signer) {
            throw new Error("NDK must have a signer configured");
        }

        this.nip17 = new NIP17Protocol(ndk, ndk.signer);

        if (options?.autoStart) {
            this.start().catch(console.error);
        }
    }

    /**
     * Start the messenger (begin listening for messages)
     */
    async start(): Promise<void> {
        if (this.started) return;

        if (!this.ndk.signer) {
            throw new Error("NDK signer not configured");
        }

        const user = await this.ndk.signer.user();
        this.myPubkey = user.pubkey;

        // Load existing conversations from storage
        await this.loadConversations();

        // Subscribe to incoming gift-wrapped messages
        await this.subscribeToMessages();

        this.started = true;
    }

    /**
     * Stop the messenger
     */
    stop(): void {
        if (this.subscription) {
            this.subscription.stop();
            this.subscription = undefined;
        }
        this.started = false;
    }

    /**
     * Send a direct message to a user
     */
    async sendMessage(recipient: NDKUser, content: string): Promise<NDKMessage> {
        if (!this.myPubkey) {
            await this.start();
        }

        // Get or create conversation
        const conversation = await this.getConversation(recipient);

        // Send the message through the conversation
        return conversation.sendMessage(content);
    }

    /**
     * Get or create a conversation with a user
     */
    async getConversation(user: NDKUser): Promise<NDKConversation> {
        if (!this.myPubkey) {
            await this.start();
        }

        // Create conversation ID (sorted pubkeys)
        const conversationId = [this.myPubkey!, user.pubkey].sort().join(':');

        // Check if conversation exists
        let conversation = this.conversations.get(conversationId);
        if (conversation) {
            return conversation;
        }

        // Create new conversation
        conversation = new NDKConversation(
            conversationId,
            [new NDKUser({ pubkey: this.myPubkey! }), user],
            'nip17', // Default to NIP-17 for now
            this.storage,
            this.myPubkey!,
            this.nip17
        );

        // Save conversation metadata
        const meta: ConversationMeta = {
            id: conversationId,
            participants: [this.myPubkey!, user.pubkey],
            protocol: 'nip17',
            unreadCount: 0
        };
        await this.storage.saveConversation(meta);

        // Store conversation
        this.conversations.set(conversationId, conversation);

        // Forward conversation events to messenger
        conversation.on('message', (message: NDKMessage) => {
            this.emit('message', message);
        });

        conversation.on('error', (error: ErrorEvent) => {
            this.emit('error', error);
        });

        return conversation;
    }

    /**
     * Get all conversations
     */
    async getConversations(): Promise<NDKConversation[]> {
        if (!this.myPubkey) {
            await this.start();
        }

        // Load conversations from storage if not already loaded
        await this.loadConversations();

        return Array.from(this.conversations.values());
    }

    /**
     * Publish DM relay list (kind 10050)
     */
    async publishDMRelays(relays: string[]): Promise<NDKEvent> {
        return this.nip17.publishDMRelayList(relays);
    }

    /**
     * Load conversations from storage
     */
    private async loadConversations(): Promise<void> {
        if (!this.myPubkey) return;

        const metas = await this.storage.getConversations(this.myPubkey);

        for (const meta of metas) {
            // Skip if already loaded
            if (this.conversations.has(meta.id)) {
                continue;
            }
            // Create NDKUser objects for participants
            const participants = meta.participants.map(pubkey =>
                new NDKUser({ pubkey })
            );

            // Create conversation instance
            const conversation = new NDKConversation(
                meta.id,
                participants,
                meta.protocol,
                this.storage,
                this.myPubkey,
                this.nip17
            );

            // Load messages into the conversation
            const messages = await this.storage.getMessages(meta.id);
            for (const message of messages) {
                // Recreate NDKUser objects for sender/recipient
                message.sender = new NDKUser({ pubkey: message.sender.pubkey });
                if (message.recipient) {
                    message.recipient = new NDKUser({ pubkey: message.recipient.pubkey });
                }
                await conversation._handleIncomingMessage(message);
            }

            // Store conversation
            this.conversations.set(meta.id, conversation);

            // Forward events
            conversation.on('message', (message: NDKMessage) => {
                this.emit('message', message);
            });

            conversation.on('error', (error: ErrorEvent) => {
                this.emit('error', error);
            });
        }
    }

    /**
     * Subscribe to incoming messages
     */
    private async subscribeToMessages(): Promise<void> {
        if (!this.myPubkey || !this.ndk.signer) return;

        const user = await this.ndk.signer.user();

        // Get the user's DM relays
        const userRelays = await this.nip17.getUserDMRelays(user);

        // Create subscription options
        const subOptions: any = {
            closeOnEose: false
        };

        // Use specific relays if available
        if (userRelays.length > 0) {
            const relaySet = NDKRelaySet.fromRelayUrls(userRelays, this.ndk);
            subOptions.relaySet = relaySet;
        }

        // Subscribe to gift-wrapped events (kind 1059) tagged with our pubkey
        this.subscription = this.ndk.subscribe(
            {
                kinds: [NDKKind.GiftWrap],
                "#p": [this.myPubkey]
            },
            subOptions
        );

        this.subscription.on("event", async (wrappedEvent: NDKEvent) => {
            await this.handleIncomingMessage(wrappedEvent);
        });

        this.subscription.on("eose", () => {
            console.log("Messages subscription active");
        });
    }

    /**
     * Handle an incoming gift-wrapped message
     */
    private async handleIncomingMessage(wrappedEvent: NDKEvent): Promise<void> {
        if (!this.myPubkey || !this.ndk.signer) return;

        try {
            // Unwrap the message
            const rumor = await this.nip17.unwrapMessage(wrappedEvent);
            if (!rumor) return;

            // Convert to NDKMessage
            const message = this.nip17.rumorToMessage(rumor, this.myPubkey);

            // Get or create conversation
            const otherPubkey = message.sender.pubkey === this.myPubkey
                ? message.recipient?.pubkey
                : message.sender.pubkey;

            if (!otherPubkey) return;

            const otherUser = new NDKUser({ pubkey: otherPubkey });
            const conversation = await this.getConversation(otherUser);

            // Add message to conversation
            await conversation._handleIncomingMessage(message);

            // Emit global message event
            this.emit('message', message);

            // Check if this creates a new conversation
            if (conversation.getMessages.length === 1) {
                this.emit('conversation-created', conversation);
            }
        } catch (error) {
            const errorEvent: ErrorEvent = {
                type: 'decryption-failed',
                message: `Failed to decrypt message: ${error}`,
                error: error as Error
            };
            this.emit('error', errorEvent);
        }
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.stop();
        this.conversations.forEach(conv => conv.destroy());
        this.conversations.clear();
        this.removeAllListeners();
    }
}