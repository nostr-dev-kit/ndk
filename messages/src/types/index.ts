import type { NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";

/**
 * Supported messaging protocols
 */
export type MessageProtocol = 'nip17' | 'mls';

/**
 * Universal message interface that works for both NIP-17 and MLS
 */
export interface NDKMessage {
    /** Unique message ID */
    id: string;

    /** Message content */
    content: string;

    /** Message sender */
    sender: NDKUser;

    /** Message recipient(s) */
    recipient?: NDKUser;
    recipients?: NDKUser[];

    /** Unix timestamp */
    timestamp: number;

    /** Protocol used for this message */
    protocol: MessageProtocol;

    /** Whether message has been read */
    read: boolean;

    /** Original rumor event for NIP-17 */
    rumor?: NostrEvent;

    /** Group ID for group messages */
    groupId?: string;

    /** Conversation ID this message belongs to */
    conversationId: string;
}

/**
 * Options for creating the messenger
 */
export interface MessengerOptions {
    /** Storage adapter to use */
    storage?: StorageAdapter;

    /** Auto-start listening for messages */
    autoStart?: boolean;

    /** Relay URLs to subscribe to for incoming messages */
    relays?: string[];
}

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
    /** Save a message */
    saveMessage(message: NDKMessage): Promise<void>;

    /** Get messages for a conversation */
    getMessages(conversationId: string, limit?: number): Promise<NDKMessage[]>;

    /** Mark messages as read */
    markAsRead(messageIds: string[]): Promise<void>;

    /** Get all conversations for a user */
    getConversations(userId: string): Promise<ConversationMeta[]>;

    /** Save conversation metadata */
    saveConversation(conversation: ConversationMeta): Promise<void>;

    /** Delete a message */
    deleteMessage(messageId: string): Promise<void>;

    /** Clear all data */
    clear(): Promise<void>;
}

/**
 * Conversation metadata
 */
export interface ConversationMeta {
    /** Unique conversation ID */
    id: string;

    /** Conversation participants */
    participants: string[]; // pubkeys

    /** Protocol being used */
    protocol: MessageProtocol;

    /** Last message timestamp */
    lastMessageAt?: number;

    /** Number of unread messages */
    unreadCount: number;

    /** Group name (for MLS groups) */
    name?: string;

    /** Group ID (for MLS) */
    groupId?: string;
}

/**
 * Event types for conversations
 */
export type ConversationEventType =
    | 'message'
    | 'state-change'
    | 'error';

/**
 * State change event types
 */
export type StateChangeType =
    | 'member-added'
    | 'member-removed'
    | 'key-rotation'
    | 'protocol-upgrade';

/**
 * State change event
 */
export interface StateChangeEvent {
    type: StateChangeType;
    user?: NDKUser;
    timestamp: number;
}

/**
 * Error event
 */
export interface ErrorEvent {
    type: 'decryption-failed' | 'send-failed' | 'subscription-failed' | 'unknown';
    message: string;
    error?: Error;
}