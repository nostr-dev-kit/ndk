import type { StorageAdapter, NDKMessage, ConversationMeta } from "../types";

/**
 * In-memory storage adapter for messages and conversations.
 * Data is lost when the application restarts.
 */
export class MemoryAdapter implements StorageAdapter {
    private messages: Map<string, NDKMessage> = new Map();
    private conversations: Map<string, ConversationMeta> = new Map();
    private messagesByConversation: Map<string, Set<string>> = new Map();

    async saveMessage(message: NDKMessage): Promise<void> {
        // Store the message
        this.messages.set(message.id, message);

        // Add to conversation index
        if (!this.messagesByConversation.has(message.conversationId)) {
            this.messagesByConversation.set(message.conversationId, new Set());
        }
        this.messagesByConversation.get(message.conversationId)!.add(message.id);

        // Update conversation metadata
        const conversation = this.conversations.get(message.conversationId);
        if (conversation) {
            conversation.lastMessageAt = message.timestamp;
            if (!message.read) {
                conversation.unreadCount++;
            }
        }
    }

    async getMessages(conversationId: string, limit?: number): Promise<NDKMessage[]> {
        const messageIds = this.messagesByConversation.get(conversationId);
        if (!messageIds) {
            return [];
        }

        const messages: NDKMessage[] = [];
        for (const id of messageIds) {
            const message = this.messages.get(id);
            if (message) {
                messages.push(message);
            }
        }

        // Sort by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);

        // Apply limit if specified
        if (limit && messages.length > limit) {
            return messages.slice(-limit);
        }

        return messages;
    }

    async markAsRead(messageIds: string[]): Promise<void> {
        for (const id of messageIds) {
            const message = this.messages.get(id);
            if (message) {
                const wasUnread = !message.read;
                message.read = true;

                // Update conversation unread count
                if (wasUnread) {
                    const conversation = this.conversations.get(message.conversationId);
                    if (conversation && conversation.unreadCount > 0) {
                        conversation.unreadCount--;
                    }
                }
            }
        }
    }

    async getConversations(userId: string): Promise<ConversationMeta[]> {
        const userConversations: ConversationMeta[] = [];

        for (const conversation of this.conversations.values()) {
            if (conversation.participants.includes(userId)) {
                userConversations.push({ ...conversation });
            }
        }

        // Sort by last message timestamp
        userConversations.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

        return userConversations;
    }

    async saveConversation(conversation: ConversationMeta): Promise<void> {
        this.conversations.set(conversation.id, { ...conversation });
    }

    async deleteMessage(messageId: string): Promise<void> {
        const message = this.messages.get(messageId);
        if (message) {
            // Remove from conversation index
            const messageIds = this.messagesByConversation.get(message.conversationId);
            if (messageIds) {
                messageIds.delete(messageId);
            }

            // Update conversation unread count if necessary
            if (!message.read) {
                const conversation = this.conversations.get(message.conversationId);
                if (conversation && conversation.unreadCount > 0) {
                    conversation.unreadCount--;
                }
            }

            // Delete the message
            this.messages.delete(messageId);
        }
    }

    async clear(): Promise<void> {
        this.messages.clear();
        this.conversations.clear();
        this.messagesByConversation.clear();
    }

    /**
     * Get a single message by ID (helper method)
     */
    async getMessage(messageId: string): Promise<NDKMessage | undefined> {
        return this.messages.get(messageId);
    }

    /**
     * Check if a message exists (helper method for deduplication)
     */
    async hasMessage(messageId: string): Promise<boolean> {
        return this.messages.has(messageId);
    }
}