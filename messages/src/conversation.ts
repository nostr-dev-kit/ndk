import { EventEmitter } from "eventemitter3";
import { NDKUser } from "@nostr-dev-kit/ndk";
import type {
    NDKMessage,
    MessageProtocol,
    StorageAdapter,
    ConversationEventType,
    StateChangeEvent,
    ErrorEvent
} from "./types";
import type { NIP17Protocol } from "./protocols/nip17";

/**
 * Represents a conversation between users.
 * Emits events for real-time updates.
 */
export class NDKConversation extends EventEmitter {
    readonly id: string;
    readonly participants: NDKUser[];
    readonly protocol: MessageProtocol;
    private messages: NDKMessage[] = [];
    private storage: StorageAdapter;
    private nip17?: NIP17Protocol;
    private myPubkey: string;

    constructor(
        id: string,
        participants: NDKUser[],
        protocol: MessageProtocol,
        storage: StorageAdapter,
        myPubkey: string,
        nip17?: NIP17Protocol
    ) {
        super();
        this.id = id;
        this.participants = participants;
        this.protocol = protocol;
        this.storage = storage;
        this.myPubkey = myPubkey;
        this.nip17 = nip17;
    }

    /**
     * Send a message in this conversation
     */
    async sendMessage(content: string): Promise<NDKMessage> {
        if (this.protocol === 'nip17' && this.nip17) {
            // For NIP-17, send to the other participant
            const recipient = this.participants.find(p => p.pubkey !== this.myPubkey);
            if (!recipient) {
                throw new Error("No recipient found in conversation");
            }

            try {
                // Send the message
                const wrappedEvent = await this.nip17.sendMessage(recipient, content);

                // Create NDKMessage from the sent message
                const message: NDKMessage = {
                    id: wrappedEvent.id || '',
                    content,
                    sender: new NDKUser({ pubkey: this.myPubkey }),
                    recipient,
                    timestamp: Math.floor(Date.now() / 1000),
                    protocol: 'nip17',
                    read: true, // Our own messages are always "read"
                    conversationId: this.id
                };

                // Save to storage
                await this.storage.saveMessage(message);

                // Add to local messages
                this.messages.push(message);

                // Emit the message event
                this.emit('message', message);

                return message;
            } catch (error) {
                const errorEvent: ErrorEvent = {
                    type: 'send-failed',
                    message: `Failed to send message: ${error}`,
                    error: error as Error
                };
                this.emit('error', errorEvent);
                throw error;
            }
        } else {
            throw new Error(`Protocol ${this.protocol} not supported yet`);
        }
    }

    /**
     * Get messages in this conversation
     */
    async getMessages(limit?: number): Promise<NDKMessage[]> {
        // Load from storage if not already loaded
        if (this.messages.length === 0) {
            this.messages = await this.storage.getMessages(this.id, limit);
        }

        if (limit && this.messages.length > limit) {
            return this.messages.slice(-limit);
        }

        return [...this.messages];
    }

    /**
     * Mark all messages as read
     */
    async markAsRead(): Promise<void> {
        const unreadMessages = this.messages.filter(m => !m.read);
        if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(m => m.id);
            await this.storage.markAsRead(messageIds);

            // Update local messages
            unreadMessages.forEach(m => m.read = true);
        }
    }

    /**
     * Get unread count
     */
    getUnreadCount(): number {
        return this.messages.filter(m => !m.read && m.sender.pubkey !== this.myPubkey).length;
    }

    /**
     * Get the other participant in a two-person conversation
     */
    getOtherParticipant(): NDKUser | undefined {
        return this.participants.find(p => p.pubkey !== this.myPubkey);
    }

    /**
     * Get the last message in the conversation
     */
    getLastMessage(): NDKMessage | undefined {
        return this.messages[this.messages.length - 1];
    }

    /**
     * Handle an incoming message (called by NDKMessenger)
     */
    async _handleIncomingMessage(message: NDKMessage): Promise<void> {
        // Check for duplicates
        const exists = this.messages.find(m => m.id === message.id);
        if (!exists) {
            // Add to messages
            this.messages.push(message);

            // Sort by timestamp
            this.messages.sort((a, b) => a.timestamp - b.timestamp);

            // Save to storage
            await this.storage.saveMessage(message);

            // Emit event
            this.emit('message', message);
        }
    }

    /**
     * Handle a state change (for future MLS support)
     */
    _handleStateChange(event: StateChangeEvent): void {
        this.emit('state-change', event);
    }

    /**
     * Handle an error
     */
    _handleError(error: ErrorEvent): void {
        this.emit('error', error);
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.removeAllListeners();
        this.messages = [];
    }
}