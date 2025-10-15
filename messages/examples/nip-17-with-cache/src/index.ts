#!/usr/bin/env tsx
/**
 * Example demonstrating NIP-17 Direct Messages with NDK cache integration
 *
 * This example shows how to use the messages package with the NDK cache system
 * for persistent storage that works across sessions.
 */

// Set up fake-indexeddb for Node.js environment
import "fake-indexeddb/auto";

import NDKCacheAdapterDexie from "@nostr-dev-kit/cache-dexie";
import { NDKMessenger } from "@nostr-dev-kit/messages";
import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import chalk from "chalk";
import { Command } from "commander";
import { readFileSync } from "fs";

// Load keys
let keys: { alice: string; bob: string };
try {
    const keysContent = readFileSync("./keys.json", "utf-8");
    keys = JSON.parse(keysContent);
} catch {
    console.error(chalk.red("❌ Keys not found. Run `bun run generate-keys` first."));
    process.exit(1);
}

// Choose which user to run as (default: alice)
const currentUser = process.env.USER || "alice";
const privateKey = keys[currentUser as keyof typeof keys];
const otherUser = currentUser === "alice" ? "bob" : "alice";
const otherKey = keys[otherUser as keyof typeof keys];

if (!privateKey) {
    console.error(chalk.red(`❌ No private key found for user: ${currentUser}`));
    process.exit(1);
}

async function setupNDK() {
    // Create cache adapter with module support
    const cacheAdapter = new NDKCacheAdapterDexie({
        dbName: `ndk-messages-${currentUser}`,
        profileCacheSize: 10000,
        eventCacheSize: 10000,
    });

    // Initialize NDK with cache
    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band"],
        signer: new NDKPrivateKeySigner(privateKey),
        cacheAdapter,
    });

    await ndk.connect();

    // Create messenger - it will automatically use the cache adapter!
    const messenger = new NDKMessenger(ndk);

    await messenger.start();

    return { ndk, messenger };
}

const program = new Command();

program
    .name("nip17-cache-demo")
    .description(`NIP-17 DM client with cache integration (running as ${chalk.blue(currentUser)})`)
    .version("1.0.0");

program
    .command("send")
    .description("Send a message to the other user")
    .argument("<message>", "Message to send")
    .action(async (message: string) => {
        const { ndk, messenger } = await setupNDK();

        const signer = new NDKPrivateKeySigner(otherKey);
        const recipientPubkey = (await signer.user()).pubkey;
        const recipient = ndk.getUser({ pubkey: recipientPubkey });

        console.log(chalk.cyan("📤 Sending message..."));

        try {
            const sentMessage = await messenger.sendMessage(recipient, message);
            console.log(chalk.green("✅ Message sent!"));
            console.log(chalk.gray(`ID: ${sentMessage.id}`));
            console.log(chalk.gray(`To: ${recipient.npub}`));
            console.log(chalk.gray(`Content: ${sentMessage.content}`));
        } catch (error) {
            console.error(chalk.red("❌ Failed to send message:"), error);
        }

        process.exit(0);
    });

program
    .command("list")
    .description("List all conversations")
    .action(async () => {
        const { messenger } = await setupNDK();

        const conversations = await messenger.getConversations();

        if (conversations.length === 0) {
            console.log(chalk.yellow("No conversations found"));
        } else {
            console.log(chalk.cyan(`📂 Found ${conversations.length} conversation(s):\n`));

            for (const conv of conversations) {
                const otherParticipant = conv.getOtherParticipant();
                const unreadCount = conv.getUnreadCount();
                const lastMessage = conv.getLastMessage();

                console.log(chalk.blue(`Conversation with ${otherParticipant?.npub || "unknown"}`));
                console.log(chalk.gray(`  ID: ${conv.id}`));
                console.log(chalk.gray(`  Protocol: ${conv.protocol}`));
                console.log(chalk.gray(`  Unread: ${unreadCount}`));

                if (lastMessage) {
                    const preview = lastMessage.content.substring(0, 50);
                    console.log(chalk.gray(`  Last: "${preview}${lastMessage.content.length > 50 ? "..." : ""}"`));
                }
                console.log();
            }
        }

        process.exit(0);
    });

program
    .command("read")
    .description("Read conversation with the other user")
    .option("-l, --limit <number>", "Number of messages to show", "10")
    .action(async (options) => {
        const { ndk, messenger } = await setupNDK();

        const signer = new NDKPrivateKeySigner(otherKey);
        const otherPubkey = (await signer.user()).pubkey;
        const otherNDKUser = ndk.getUser({ pubkey: otherPubkey });

        const conversation = await messenger.getConversation(otherNDKUser);
        const messages = await conversation.getMessages(parseInt(options.limit));

        if (messages.length === 0) {
            console.log(chalk.yellow("No messages in this conversation"));
        } else {
            console.log(chalk.cyan(`💬 Conversation with ${otherNDKUser.npub}\n`));
            console.log(chalk.gray("(Messages are persisted in IndexedDB via Dexie)\n"));

            const myPubkey = messenger.myPubkey;

            for (const msg of messages) {
                const isMe = msg.sender.pubkey === myPubkey;
                const timestamp = new Date(msg.timestamp * 1000).toLocaleString();

                if (isMe) {
                    console.log(chalk.blue(`[${timestamp}] You: ${msg.content}`));
                } else {
                    console.log(chalk.green(`[${timestamp}] ${otherUser}: ${msg.content}`));
                }
            }

            // Mark as read
            await conversation.markAsRead();
            console.log(chalk.gray("\n✓ Marked as read"));
        }

        process.exit(0);
    });

program
    .command("listen")
    .description("Listen for incoming messages (real-time)")
    .action(async () => {
        const { messenger } = await setupNDK();

        console.log(chalk.cyan("👂 Listening for messages..."));
        console.log(chalk.gray("Messages are automatically saved to cache"));
        console.log(chalk.gray("Press Ctrl+C to stop\n"));

        // Listen for all messages
        messenger.on("message", (message) => {
            const timestamp = new Date(message.timestamp * 1000).toLocaleString();
            console.log(chalk.green(`\n[${timestamp}] New message from ${message.sender.npub}:`));
            console.log(message.content);
            console.log(chalk.gray("(Saved to cache)"));
        });

        // Keep the process running
        process.stdin.resume();
    });

program
    .command("stats")
    .description("Show cache statistics")
    .action(async () => {
        const { ndk, messenger } = await setupNDK();

        console.log(chalk.cyan("📊 Cache Statistics:\n"));

        const conversations = await messenger.getConversations();
        let totalMessages = 0;
        let totalUnread = 0;

        for (const conv of conversations) {
            const messages = await conv.getMessages();
            totalMessages += messages.length;
            totalUnread += conv.getUnreadCount();
        }

        console.log(chalk.blue(`Database: ndk-messages-${currentUser}`));
        console.log(chalk.gray(`Conversations: ${conversations.length}`));
        console.log(chalk.gray(`Total messages: ${totalMessages}`));
        console.log(chalk.gray(`Unread messages: ${totalUnread}`));
        console.log();
        console.log(chalk.yellow("💡 Data persists across sessions using IndexedDB"));

        process.exit(0);
    });

program
    .command("clear")
    .description("Clear all cached messages")
    .action(async () => {
        const { messenger } = await setupNDK();

        console.log(chalk.yellow("⚠️  Clearing all cached messages..."));

        const storage = (messenger as any).storage;
        if (storage?.clear) {
            await storage.clear();
            console.log(chalk.green("✅ Cache cleared"));
        } else {
            console.log(chalk.red("❌ Unable to clear cache"));
        }

        process.exit(0);
    });

program.parse();
