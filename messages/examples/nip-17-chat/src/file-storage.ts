import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { StorageAdapter, NDKMessage, ConversationMeta } from '@nostr-dev-kit/messages';

interface StoredData {
    messages: NDKMessage[];
    conversations: ConversationMeta[];
}

/**
 * File-based storage adapter for the example app
 */
export class FileStorageAdapter implements StorageAdapter {
    private data: StoredData;
    private filePath: string;

    constructor(filePath: string = './conversations.json') {
        this.filePath = filePath;
        this.data = this.load();
    }

    private load(): StoredData {
        if (existsSync(this.filePath)) {
            try {
                const content = readFileSync(this.filePath, 'utf-8');
                return JSON.parse(content);
            } catch (error) {
                console.error('Failed to load storage:', error);
            }
        }
        return { messages: [], conversations: [] };
    }

    private save(): void {
        try {
            writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Failed to save storage:', error);
        }
    }

    async saveMessage(message: NDKMessage): Promise<void> {
        // Serialize NDKUser objects properly
        const serializedMessage = {
            ...message,
            sender: { pubkey: message.sender.pubkey },
            recipient: message.recipient ? { pubkey: message.recipient.pubkey } : undefined
        };

        // Check for duplicates
        const existingIndex = this.data.messages.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
            this.data.messages[existingIndex] = serializedMessage as any;
        } else {
            this.data.messages.push(serializedMessage as any);
        }

        // Update conversation metadata
        const conversation = this.data.conversations.find(c => c.id === message.conversationId);
        if (conversation) {
            conversation.lastMessageAt = message.timestamp;
            if (!message.read && message.sender.pubkey !== message.recipient?.pubkey) {
                conversation.unreadCount++;
            }
        }

        this.save();
    }

    async getMessages(conversationId: string, limit?: number): Promise<NDKMessage[]> {
        let messages = this.data.messages
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => a.timestamp - b.timestamp);

        if (limit && messages.length > limit) {
            messages = messages.slice(-limit);
        }

        return messages;
    }

    async markAsRead(messageIds: string[]): Promise<void> {
        for (const id of messageIds) {
            const message = this.data.messages.find(m => m.id === id);
            if (message) {
                const wasUnread = !message.read;
                message.read = true;

                if (wasUnread) {
                    const conversation = this.data.conversations.find(c => c.id === message.conversationId);
                    if (conversation && conversation.unreadCount > 0) {
                        conversation.unreadCount--;
                    }
                }
            }
        }
        this.save();
    }

    async getConversations(userId: string): Promise<ConversationMeta[]> {
        return this.data.conversations
            .filter(c => c.participants.includes(userId))
            .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    }

    async saveConversation(conversation: ConversationMeta): Promise<void> {
        const existingIndex = this.data.conversations.findIndex(c => c.id === conversation.id);
        if (existingIndex >= 0) {
            this.data.conversations[existingIndex] = conversation;
        } else {
            this.data.conversations.push(conversation);
        }
        this.save();
    }

    async deleteMessage(messageId: string): Promise<void> {
        const index = this.data.messages.findIndex(m => m.id === messageId);
        if (index >= 0) {
            const message = this.data.messages[index];

            if (!message.read) {
                const conversation = this.data.conversations.find(c => c.id === message.conversationId);
                if (conversation && conversation.unreadCount > 0) {
                    conversation.unreadCount--;
                }
            }

            this.data.messages.splice(index, 1);
            this.save();
        }
    }

    async clear(): Promise<void> {
        this.data = { messages: [], conversations: [] };
        this.save();
    }
}