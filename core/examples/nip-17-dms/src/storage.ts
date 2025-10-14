import { readFileSync, writeFileSync, existsSync } from "node:fs";
import type { NostrEvent } from "@nostr-dev-kit/ndk";

export interface StoredMessage {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    created_at: number;
    read: boolean;
    // Store the original rumor event for reference
    rumor: NostrEvent;
}

export interface ConversationData {
    messages: StoredMessage[];
}

const STORAGE_FILE = "./conversations.json";

/**
 * Simple file-based storage for conversations.
 * In production, you'd want a proper database.
 */
export class ConversationStorage {
    private data: ConversationData;

    constructor() {
        this.data = this.load();
    }

    private load(): ConversationData {
        if (existsSync(STORAGE_FILE)) {
            try {
                const content = readFileSync(STORAGE_FILE, "utf-8");
                return JSON.parse(content);
            } catch (error) {
                console.error("Failed to load conversations:", error);
                return { messages: [] };
            }
        }
        return { messages: [] };
    }

    private save(): void {
        try {
            writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), "utf-8");
        } catch (error) {
            console.error("Failed to save conversations:", error);
        }
    }

    addMessage(message: StoredMessage): void {
        // Avoid duplicates
        const exists = this.data.messages.some((m) => m.id === message.id);
        if (!exists) {
            this.data.messages.push(message);
            this.save();
        }
    }

    getConversation(userPubkey: string, otherPubkey: string): StoredMessage[] {
        return this.data.messages
            .filter(
                (m) =>
                    (m.sender === userPubkey && m.recipient === otherPubkey) ||
                    (m.sender === otherPubkey && m.recipient === userPubkey),
            )
            .sort((a, b) => a.created_at - b.created_at);
    }

    getAllConversations(userPubkey: string): Map<string, StoredMessage[]> {
        const conversations = new Map<string, StoredMessage[]>();

        for (const message of this.data.messages) {
            let otherPubkey: string;
            if (message.sender === userPubkey) {
                otherPubkey = message.recipient;
            } else if (message.recipient === userPubkey) {
                otherPubkey = message.sender;
            } else {
                continue;
            }

            if (!conversations.has(otherPubkey)) {
                conversations.set(otherPubkey, []);
            }
            conversations.get(otherPubkey)!.push(message);
        }

        // Sort messages in each conversation
        for (const messages of conversations.values()) {
            messages.sort((a, b) => a.created_at - b.created_at);
        }

        return conversations;
    }

    markAsRead(messageIds: string[]): void {
        let changed = false;
        for (const message of this.data.messages) {
            if (messageIds.includes(message.id) && !message.read) {
                message.read = true;
                changed = true;
            }
        }
        if (changed) {
            this.save();
        }
    }

    getUnreadCount(userPubkey: string, otherPubkey: string): number {
        return this.data.messages.filter((m) => m.sender === otherPubkey && m.recipient === userPubkey && !m.read)
            .length;
    }
}
