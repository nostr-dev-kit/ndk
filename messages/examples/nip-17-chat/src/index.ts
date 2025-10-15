#!/usr/bin/env tsx
/**
 * NIP-17 Chat Example using @nostr-dev-kit/messages
 *
 * This demonstrates the new high-level messaging API that simplifies NIP-17 implementation.
 */

import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKMessenger, type NDKMessage } from "@nostr-dev-kit/messages";
import { nip19 } from "nostr-tools";
import { FileStorageAdapter } from "./file-storage.js";

// Default relays for the example
const DEFAULT_RELAYS = [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.nostr.band",
];

/**
 * Initialize NDK and the messenger
 */
async function initializeMessenger(nsec: string): Promise<NDKMessenger> {
    // Decode the nsec
    const decoded = nip19.decode(nsec);
    if (decoded.type !== "nsec") {
        throw new Error("Invalid nsec");
    }
    const secretKey = decoded.data as Uint8Array;
    const secretKeyHex = Buffer.from(secretKey).toString('hex');

    // Initialize NDK
    const signer = new NDKPrivateKeySigner(secretKeyHex);
    const ndk = new NDK({
        explicitRelayUrls: DEFAULT_RELAYS,
        signer,
    });

    await ndk.connect();
    console.log(`Connected to ${ndk.pool.connectedRelays().size} relays`);

    // Initialize messenger with file storage
    const messenger = new NDKMessenger(ndk, {
        storage: new FileStorageAdapter('./conversations.json')
    });

    await messenger.start();

    // Get user info
    const user = await signer.user();
    console.log(`Logged in as: ${user.npub}`);
    console.log();

    return messenger;
}

/**
 * Send a direct message
 */
async function sendMessage(nsec: string, recipientNpub: string, message: string) {
    console.log("📤 Sending message...\n");

    const messenger = await initializeMessenger(nsec);

    // Parse recipient npub
    const decoded = nip19.decode(recipientNpub);
    if (decoded.type !== "npub") {
        throw new Error("Invalid npub");
    }
    const recipientPubkey = decoded.data as string;
    const recipient = await messenger.ndk.getUser({ pubkey: recipientPubkey });

    try {
        // Send message using the high-level API
        const sentMessage = await messenger.sendMessage(recipient, message);

        console.log(`✅ Message sent successfully!`);
        console.log(`   To: ${recipientNpub}`);
        console.log(`   Content: "${message}"`);
        console.log(`   Message ID: ${sentMessage.id}`);
        console.log(`   Protocol: NIP-17 (gift-wrapped)`);
    } catch (error) {
        console.error("❌ Failed to send message:", error);
        process.exit(1);
    }

    messenger.destroy();
}

/**
 * List all conversations
 */
async function listConversations(nsec: string) {
    console.log("📋 Loading conversations...\n");

    const messenger = await initializeMessenger(nsec);

    const conversations = await messenger.getConversations();

    if (conversations.length === 0) {
        console.log("No conversations yet. Send a message to start chatting!");
    } else {
        console.log(`Found ${conversations.length} conversation(s):\n`);
        console.log("=" + "=".repeat(79));

        for (const conversation of conversations) {
            const otherParticipant = conversation.getOtherParticipant();
            if (!otherParticipant) continue;

            const unreadCount = conversation.getUnreadCount();
            const lastMessage = conversation.getLastMessage();
            const messages = await conversation.getMessages();

            console.log(`\n👤 ${nip19.npubEncode(otherParticipant.pubkey)}`);
            console.log(`   Messages: ${messages.length}`);
            console.log(`   Unread: ${unreadCount > 0 ? `📬 ${unreadCount} new` : "✓ All read"}`);

            if (lastMessage) {
                const preview = lastMessage.content.length > 50
                    ? lastMessage.content.substring(0, 47) + "..."
                    : lastMessage.content;
                const timestamp = new Date(lastMessage.timestamp * 1000).toLocaleString();
                const direction = lastMessage.sender.pubkey === messenger.myPubkey ? "You" : "Them";
                console.log(`   Last: [${timestamp}] ${direction}: ${preview}`);
            }
        }

        console.log("\n" + "=".repeat(80));
        console.log(`\n💡 Tip: Use 'read' command to view a full conversation`);
    }

    messenger.destroy();
}

/**
 * Read a specific conversation
 */
async function readConversation(nsec: string, otherNpub: string) {
    console.log("📖 Loading conversation...\n");

    const messenger = await initializeMessenger(nsec);
    const myPubkey = (await messenger.ndk.signer!.user()).pubkey;

    // Parse other user's npub
    const decoded = nip19.decode(otherNpub);
    if (decoded.type !== "npub") {
        throw new Error("Invalid npub");
    }
    const otherPubkey = decoded.data as string;
    const otherUser = await messenger.ndk.getUser({ pubkey: otherPubkey });

    // Get conversation
    const conversation = await messenger.getConversation(otherUser);
    const messages = await conversation.getMessages();

    if (messages.length === 0) {
        console.log(`No messages with ${otherNpub} yet.`);
    } else {
        console.log(`Conversation with ${otherNpub}`);
        console.log(`${messages.length} message(s)`);
        console.log("=" + "=".repeat(79) + "\n");

        for (const msg of messages) {
            const timestamp = new Date(msg.timestamp * 1000).toLocaleString();
            const isMe = msg.sender.pubkey === myPubkey;
            const sender = isMe ? "You" : "Them";
            const marker = isMe ? "→" : "←";

            console.log(`${marker} [${timestamp}] ${sender}:`);
            console.log(`  ${msg.content}`);
            console.log();
        }

        // Mark all messages as read
        await conversation.markAsRead();
        console.log("✓ All messages marked as read");
    }

    messenger.destroy();
}

/**
 * Listen for incoming messages
 */
async function listen(nsec: string, duration: number = 30) {
    console.log(`👂 Listening for messages for ${duration} seconds...\n`);

    const messenger = await initializeMessenger(nsec);

    // Set up message handler
    messenger.on('message', (message: NDKMessage) => {
        // Only show incoming messages (not our own)
        if (message.sender.pubkey !== messenger.myPubkey) {
            const timestamp = new Date(message.timestamp * 1000).toLocaleTimeString();
            const senderNpub = nip19.npubEncode(message.sender.pubkey);

            console.log(`\n💬 New message received!`);
            console.log(`   From: ${senderNpub}`);
            console.log(`   Time: ${timestamp}`);
            console.log(`   Content: "${message.content}"`);
            console.log(`   Protocol: ${message.protocol}`);
        }
    });

    messenger.on('conversation-created', (conversation) => {
        const other = conversation.getOtherParticipant();
        if (other) {
            console.log(`\n🎉 New conversation started with ${nip19.npubEncode(other.pubkey)}`);
        }
    });

    messenger.on('error', (error) => {
        console.error('\n❌ Error:', error.message);
    });

    console.log("Waiting for messages... (Press Ctrl+C to stop)");

    // Keep listening for the specified duration
    await new Promise(resolve => setTimeout(resolve, duration * 1000));

    console.log("\n⏱️  Listening period ended");
    messenger.destroy();
}

/**
 * Publish DM relay list
 */
async function publishRelayList(nsec: string, relays: string[]) {
    console.log("📡 Publishing DM relay list...\n");

    const messenger = await initializeMessenger(nsec);

    try {
        const event = await messenger.publishDMRelays(relays);

        console.log("✅ DM relay list published!");
        console.log(`   Event ID: ${event.id}`);
        console.log(`   Kind: ${event.kind} (DirectMessageReceiveRelayList)`);
        console.log(`   Relays: ${relays.join(", ")}`);
    } catch (error) {
        console.error("❌ Failed to publish relay list:", error);
        process.exit(1);
    }

    messenger.destroy();
}

/**
 * Main CLI handler
 */
async function main() {
    const [command, ...args] = process.argv.slice(2);

    try {
        switch (command) {
            case "send": {
                const [nsec, npub, ...messageParts] = args;
                if (!nsec || !npub || messageParts.length === 0) {
                    console.error("Usage: send <your-nsec> <recipient-npub> <message>");
                    process.exit(1);
                }
                const message = messageParts.join(" ");
                await sendMessage(nsec, npub, message);
                break;
            }

            case "list": {
                const [nsec] = args;
                if (!nsec) {
                    console.error("Usage: list <your-nsec>");
                    process.exit(1);
                }
                await listConversations(nsec);
                break;
            }

            case "read": {
                const [nsec, npub] = args;
                if (!nsec || !npub) {
                    console.error("Usage: read <your-nsec> <other-npub>");
                    process.exit(1);
                }
                await readConversation(nsec, npub);
                break;
            }

            case "listen": {
                const [nsec, durationStr] = args;
                if (!nsec) {
                    console.error("Usage: listen <your-nsec> [duration-seconds]");
                    process.exit(1);
                }
                const duration = durationStr ? parseInt(durationStr, 10) : 30;
                await listen(nsec, duration);
                break;
            }

            case "relay-list": {
                const [nsec, ...relays] = args;
                if (!nsec || relays.length === 0) {
                    console.error("Usage: relay-list <your-nsec> <relay-url> [relay-url...]");
                    process.exit(1);
                }
                await publishRelayList(nsec, relays);
                break;
            }

            default: {
                console.log("NIP-17 Chat Example using @nostr-dev-kit/messages");
                console.log("=" + "=".repeat(79));
                console.log("\nCommands:");
                console.log("  send <nsec> <npub> <message>     Send a direct message");
                console.log("  list <nsec>                       List all conversations");
                console.log("  read <nsec> <npub>                Read conversation with user");
                console.log("  listen <nsec> [seconds]           Listen for incoming messages");
                console.log("  relay-list <nsec> <urls...>       Publish DM relay list");
                console.log("\nFirst time? Run: bunx tsx generate-keys.ts");
                break;
            }
        }
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the CLI
main().catch(console.error);