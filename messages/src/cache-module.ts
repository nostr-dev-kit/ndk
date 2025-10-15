import type { CacheModuleDefinition } from "@nostr-dev-kit/ndk";

/**
 * Cache module definition for the messages package
 */
export const messagesCacheModule: CacheModuleDefinition = {
    namespace: "messages",
    version: 1,

    collections: {
        messages: {
            primaryKey: "id",
            indexes: ["conversationId", "timestamp", "sender", "recipient"],
            compoundIndexes: [
                ["conversationId", "timestamp"], // For fetching conversation messages in order
                ["recipient", "read"], // For fetching unread messages for a user
            ],
            schema: {
                id: "string",
                content: "string",
                sender: "string", // pubkey
                recipient: "string?", // pubkey, optional for group messages
                timestamp: "number",
                protocol: "string",
                read: "boolean",
                rumor: "object?",
                conversationId: "string",
            },
        },

        conversations: {
            primaryKey: "id",
            indexes: ["lastMessageAt"],
            compoundIndexes: [
                ["participants"], // For finding conversations by participant
            ],
            schema: {
                id: "string",
                participants: "string[]", // array of pubkeys
                name: "string?",
                avatar: "string?",
                lastMessageAt: "number?",
                unreadCount: "number",
                protocol: "string",
                metadata: "object?",
            },
        },

        // For future MLS support
        mlsGroups: {
            primaryKey: "id",
            indexes: ["createdAt"],
            schema: {
                id: "string",
                groupId: "string",
                epoch: "number",
                members: "string[]",
                createdAt: "number",
                updatedAt: "number",
                treeHash: "string",
                confirmedTranscriptHash: "string",
                interimTranscriptHash: "string",
                groupContext: "string", // serialized binary
            },
        },

        // Track which relays are used for DMs
        dmRelays: {
            primaryKey: "pubkey",
            indexes: ["updatedAt"],
            schema: {
                pubkey: "string",
                relays: "string[]",
                updatedAt: "number",
            },
        },
    },

    migrations: {
        1: async (context) => {
            // Initial setup - create all collections
            await context.createCollection("messages", messagesCacheModule.collections.messages);
            await context.createCollection("conversations", messagesCacheModule.collections.conversations);
            await context.createCollection("mlsGroups", messagesCacheModule.collections.mlsGroups);
            await context.createCollection("dmRelays", messagesCacheModule.collections.dmRelays);
        },

        // Future migrations would go here
        // 2: async (context) => {
        //     // Add new field or index
        //     await context.addIndex('messages', 'newField');
        // }
    },
};

/**
 * Type definitions derived from the schema
 */
export interface CachedMessage {
    id: string;
    content: string;
    sender: string;
    recipient?: string;
    timestamp: number;
    protocol: "nip17" | "mls";
    read: boolean;
    rumor?: any;
    conversationId: string;
}

export interface CachedConversation {
    id: string;
    participants: string[];
    name?: string;
    avatar?: string;
    lastMessageAt?: number;
    unreadCount: number;
    protocol: "nip17" | "mls";
    metadata?: Record<string, any>;
}

export interface CachedMLSGroup {
    id: string;
    groupId: string;
    epoch: number;
    members: string[];
    createdAt: number;
    updatedAt: number;
    treeHash: string;
    confirmedTranscriptHash: string;
    interimTranscriptHash: string;
    groupContext: string;
}

export interface CachedDMRelay {
    pubkey: string;
    relays: string[];
    updatedAt: number;
}
