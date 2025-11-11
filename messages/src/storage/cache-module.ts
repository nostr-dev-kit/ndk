import type { CacheModuleCollection, NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { type CachedConversation, type CachedMessage, messagesCacheModule } from "../cache-module";
import type { ConversationMeta, NDKMessage, StorageAdapter } from "../types";

/**
 * Storage adapter that uses the NDK cache module system
 */
export class CacheModuleStorage implements StorageAdapter {
    private messagesCollection?: CacheModuleCollection<CachedMessage>;
    private conversationsCollection?: CacheModuleCollection<CachedConversation>;
    private initialized = false;

    constructor(
        private cache: NDKCacheAdapter,
        private myPubkey: string,
    ) {}

    /**
     * Initialize the storage by registering the module and getting collections
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;

        // Register the module if the cache supports it
        if (this.cache.registerModule) {
            await this.cache.registerModule(messagesCacheModule);
        }

        // Get collections if the cache supports modules
        if (this.cache.getModuleCollection) {
            this.messagesCollection = await this.cache.getModuleCollection<CachedMessage>("messages", "messages");
            this.conversationsCollection = await this.cache.getModuleCollection<CachedConversation>(
                "messages",
                "conversations",
            );
        }

        this.initialized = true;
    }

    async saveMessage(message: NDKMessage): Promise<void> {
        await this.ensureInitialized();
        if (!this.messagesCollection) return;

        const cachedMessage: CachedMessage = {
            id: message.id,
            content: message.content,
            sender: message.sender.pubkey,
            recipient: message.recipient?.pubkey,
            timestamp: message.timestamp,
            protocol: message.protocol,
            read: message.read,
            rumor: message.rumor,
            conversationId: message.conversationId,
        };

        await this.messagesCollection.save(cachedMessage);

        // Update conversation metadata
        await this.updateConversationForMessage(message);
    }

    private async updateConversationForMessage(message: NDKMessage): Promise<void> {
        if (!this.conversationsCollection) return;

        const conversation = await this.conversationsCollection.get(message.conversationId);

        if (conversation) {
            // Update existing conversation
            conversation.lastMessageAt = message.timestamp;

            // Update unread count if this is an incoming unread message
            if (!message.read && message.sender.pubkey !== this.myPubkey) {
                conversation.unreadCount++;
            }

            await this.conversationsCollection.save(conversation);
        } else {
            // Create new conversation
            const participants = [message.sender.pubkey];
            if (message.recipient) {
                participants.push(message.recipient.pubkey);
            }

            const newConversation: CachedConversation = {
                id: message.conversationId,
                participants: [...new Set(participants)], // Deduplicate
                lastMessageAt: message.timestamp,
                unreadCount: !message.read && message.sender.pubkey !== this.myPubkey ? 1 : 0,
                protocol: message.protocol,
            };

            await this.conversationsCollection.save(newConversation);
        }
    }

    async getMessages(conversationId: string, limit?: number): Promise<NDKMessage[]> {
        await this.ensureInitialized();
        if (!this.messagesCollection) return [];

        // Find messages for this conversation, sorted by timestamp
        const cachedMessages = await this.messagesCollection.findBy("conversationId", conversationId);

        // Sort by timestamp
        cachedMessages.sort((a, b) => a.timestamp - b.timestamp);

        // Apply limit if specified
        let messages = cachedMessages;
        if (limit && messages.length > limit) {
            messages = messages.slice(-limit);
        }

        // Convert back to NDKMessage format
        return messages.map((cached) => ({
            id: cached.id,
            content: cached.content,
            sender: new NDKUser({ pubkey: cached.sender }),
            recipient: cached.recipient ? new NDKUser({ pubkey: cached.recipient }) : undefined,
            timestamp: cached.timestamp,
            protocol: cached.protocol,
            read: cached.read,
            rumor: cached.rumor,
            conversationId: cached.conversationId,
        }));
    }

    async markAsRead(messageIds: string[]): Promise<void> {
        await this.ensureInitialized();
        if (!this.messagesCollection || !this.conversationsCollection) return;

        // Update each message
        for (const id of messageIds) {
            const message = await this.messagesCollection.get(id);
            if (message && !message.read) {
                message.read = true;
                await this.messagesCollection.save(message);

                // Update conversation unread count
                const conversation = await this.conversationsCollection.get(message.conversationId);
                if (conversation && conversation.unreadCount > 0) {
                    conversation.unreadCount--;
                    await this.conversationsCollection.save(conversation);
                }
            }
        }
    }

    async getConversations(userId: string): Promise<ConversationMeta[]> {
        await this.ensureInitialized();
        if (!this.conversationsCollection) return [];

        // Get all conversations
        const allConversations = await this.conversationsCollection.all();

        // Filter for conversations that include this user
        const userConversations = allConversations.filter((conv) => conv.participants.includes(userId));

        // Sort by last message timestamp (most recent first)
        userConversations.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

        // Convert to ConversationMeta format
        return userConversations.map((conv) => ({
            id: conv.id,
            participants: conv.participants,
            protocol: conv.protocol,
            name: conv.name,
            lastMessageAt: conv.lastMessageAt,
            unreadCount: conv.unreadCount,
        }));
    }

    async saveConversation(conversation: ConversationMeta): Promise<void> {
        await this.ensureInitialized();
        if (!this.conversationsCollection) return;

        const cachedConversation: CachedConversation = {
            id: conversation.id,
            participants: conversation.participants,
            name: conversation.name,
            lastMessageAt: conversation.lastMessageAt,
            unreadCount: conversation.unreadCount,
            protocol: conversation.protocol,
        };

        await this.conversationsCollection.save(cachedConversation);
    }

    async deleteMessage(messageId: string): Promise<void> {
        await this.ensureInitialized();
        if (!this.messagesCollection) return;

        const message = await this.messagesCollection.get(messageId);
        if (message) {
            // Update conversation unread count if needed
            if (!message.read && this.conversationsCollection) {
                const conversation = await this.conversationsCollection.get(message.conversationId);
                if (conversation && conversation.unreadCount > 0) {
                    conversation.unreadCount--;
                    await this.conversationsCollection.save(conversation);
                }
            }

            // Delete the message
            await this.messagesCollection.delete(messageId);
        }
    }

    async clear(): Promise<void> {
        await this.ensureInitialized();

        if (this.messagesCollection) {
            await this.messagesCollection.clear();
        }

        if (this.conversationsCollection) {
            await this.conversationsCollection.clear();
        }
    }
}
