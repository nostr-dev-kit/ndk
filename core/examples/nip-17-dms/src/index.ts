#!/usr/bin/env node

import NDK, { NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import chalk from "chalk";
import ora from "ora";
import { DMManager } from "./dm-manager.js";

const DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band", "wss://relay.primal.net"];

/**
 * NIP-17 Direct Messages CLI
 *
 * Usage:
 *   bun src/index.ts send <nsec> <recipient-npub> <message>
 *   bun src/index.ts list <nsec>
 *   bun src/index.ts read <nsec> <other-npub>
 *   bun src/index.ts listen <nsec> [duration-seconds]
 */

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        printUsage();
        process.exit(0);
    }

    const command = args[0];

    try {
        switch (command) {
            case "send":
                await handleSend(args);
                break;
            case "list":
                await handleList(args);
                break;
            case "read":
                await handleRead(args);
                break;
            case "listen":
                await handleListen(args);
                break;
            case "relay-list":
                await handleRelayList(args);
                break;
            case "help":
                printUsage();
                break;
            default:
                console.error(chalk.red(`Unknown command: ${command}`));
                printUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(chalk.red("Error:"), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

function printUsage() {
    console.log(chalk.bold("\nNIP-17 Direct Messages CLI\n"));
    console.log("Usage:");
    console.log("  send <nsec> <recipient-npub> <message>  Send a DM");
    console.log("  list <nsec>                             List all conversations");
    console.log("  read <nsec> <other-npub>                Read conversation with user");
    console.log("  listen <nsec> [seconds]                 Listen for incoming DMs (default: 30s)");
    console.log("  relay-list <nsec> <relay-urls...>       Publish DM relay list (kind 10050)");
    console.log("  help                                    Show this help");
    console.log();
    console.log("Examples:");
    console.log(chalk.dim("  bun src/index.ts send nsec1... npub1... 'Hello!'"));
    console.log(chalk.dim("  bun src/index.ts list nsec1..."));
    console.log(chalk.dim("  bun src/index.ts read nsec1... npub1..."));
    console.log(chalk.dim("  bun src/index.ts listen nsec1... 60"));
    console.log(chalk.dim("  bun src/index.ts relay-list nsec1... wss://relay.damus.io wss://nos.lol"));
    console.log();
}

async function handleSend(args: string[]) {
    if (args.length < 4) {
        console.error(chalk.red("Usage: send <nsec> <recipient-npub> <message>"));
        process.exit(1);
    }

    const [, nsecOrHex, recipientNpubOrHex, ...messageParts] = args;
    const message = messageParts.join(" ");

    const spinner = ora("Initializing NDK...").start();

    // Initialize NDK
    const { ndk, dmManager } = await initNDK(nsecOrHex);
    const sender = await ndk.signer!.user();

    spinner.succeed(`Connected as ${chalk.cyan(sender.npub)}`);

    // Parse recipient
    const recipientPubkey = parseUserIdentifier(recipientNpubOrHex);
    const recipient = new NDKUser({ pubkey: recipientPubkey });
    recipient.ndk = ndk;

    spinner.start(`Sending message to ${chalk.cyan(recipient.npub)}...`);

    // Send the DM
    await dmManager.sendDM(recipient, message);

    spinner.succeed(chalk.green("Message sent!"));

    process.exit(0);
}

async function handleList(args: string[]) {
    if (args.length < 2) {
        console.error(chalk.red("Usage: list <nsec>"));
        process.exit(1);
    }

    const [, nsecOrHex] = args;

    const spinner = ora("Initializing NDK...").start();

    const { ndk, dmManager } = await initNDK(nsecOrHex);
    const user = await ndk.signer!.user();

    spinner.succeed(`Connected as ${chalk.cyan(user.npub)}`);

    // Get all conversations
    const conversations = await dmManager.getConversations();

    if (conversations.size === 0) {
        console.log(chalk.yellow("\nNo conversations found."));
        process.exit(0);
    }

    console.log(chalk.bold(`\nConversations (${conversations.size}):\n`));

    for (const [otherPubkey, messages] of conversations.entries()) {
        const otherUser = new NDKUser({ pubkey: otherPubkey });
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter((m) => !m.read && m.sender === otherPubkey).length;

        const preview = lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? "..." : "");
        const unreadBadge = unreadCount > 0 ? chalk.red(` (${unreadCount} unread)`) : "";

        console.log(chalk.cyan(otherUser.npub) + unreadBadge);
        console.log(chalk.dim(`  Last: ${preview}`));
        console.log(chalk.dim(`  Time: ${new Date(lastMessage.created_at * 1000).toLocaleString()}`));
        console.log();
    }

    process.exit(0);
}

async function handleRead(args: string[]) {
    if (args.length < 3) {
        console.error(chalk.red("Usage: read <nsec> <other-npub>"));
        process.exit(1);
    }

    const [, nsecOrHex, otherNpubOrHex] = args;

    const spinner = ora("Initializing NDK...").start();

    const { ndk, dmManager } = await initNDK(nsecOrHex);
    const user = await ndk.signer!.user();

    spinner.succeed(`Connected as ${chalk.cyan(user.npub)}`);

    const otherPubkey = parseUserIdentifier(otherNpubOrHex);
    const otherUser = new NDKUser({ pubkey: otherPubkey });

    const messages = await dmManager.getConversation(otherPubkey);

    if (messages.length === 0) {
        console.log(chalk.yellow(`\nNo conversation with ${otherUser.npub}`));
        process.exit(0);
    }

    console.log(chalk.bold(`\nConversation with ${chalk.cyan(otherUser.npub)}\n`));

    for (const msg of messages) {
        const isFromMe = msg.sender === user.pubkey;
        const timestamp = new Date(msg.created_at * 1000).toLocaleString();

        if (isFromMe) {
            console.log(chalk.green(`You [${timestamp}]:`));
            console.log(chalk.white(`  ${msg.content}`));
        } else {
            console.log(chalk.blue(`Them [${timestamp}]:`));
            console.log(chalk.white(`  ${msg.content}`));
        }
        console.log();
    }

    // Mark messages as read
    const unreadIds = messages.filter((m) => !m.read && m.sender === otherPubkey).map((m) => m.id);
    if (unreadIds.length > 0) {
        dmManager.markAsRead(unreadIds);
        console.log(chalk.dim(`Marked ${unreadIds.length} message(s) as read`));
    }

    process.exit(0);
}

async function handleListen(args: string[]) {
    if (args.length < 2) {
        console.error(chalk.red("Usage: listen <nsec> [duration-seconds]"));
        process.exit(1);
    }

    const [, nsecOrHex, durationStr] = args;
    const duration = durationStr ? Number.parseInt(durationStr, 10) : 30;

    const spinner = ora("Initializing NDK...").start();

    const { ndk, dmManager } = await initNDK(nsecOrHex);
    const user = await ndk.signer!.user();

    spinner.succeed(`Connected as ${chalk.cyan(user.npub)}`);

    console.log(chalk.yellow(`\nListening for DMs for ${duration} seconds...\n`));

    // Subscribe to DMs
    await dmManager.subscribeToDMs((message) => {
        const sender = new NDKUser({ pubkey: message.sender });
        console.log(chalk.green("\n📩 New message received!"));
        console.log(chalk.blue(`From: ${sender.npub}`));
        console.log(chalk.white(`Message: ${message.content}`));
        console.log(chalk.dim(`Time: ${new Date(message.created_at * 1000).toLocaleString()}\n`));
    });

    // Wait for the specified duration
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));

    console.log(chalk.yellow("\nStopping listener..."));
    process.exit(0);
}

async function handleRelayList(args: string[]) {
    if (args.length < 3) {
        console.error(chalk.red("Usage: relay-list <nsec> <relay-urls...>"));
        process.exit(1);
    }

    const [, nsecOrHex, ...relays] = args;

    const spinner = ora("Initializing NDK...").start();

    const { ndk, dmManager } = await initNDK(nsecOrHex);
    const user = await ndk.signer!.user();

    spinner.succeed(`Connected as ${chalk.cyan(user.npub)}`);

    spinner.start(`Publishing DM relay list with ${relays.length} relay(s)...`);

    await dmManager.publishDMRelayList(relays);

    spinner.succeed(chalk.green("DM relay list published!"));

    console.log(chalk.dim("\nRelays:"));
    for (const relay of relays) {
        console.log(chalk.dim(`  - ${relay}`));
    }

    process.exit(0);
}

async function initNDK(nsecOrHex: string): Promise<{ ndk: NDK; dmManager: DMManager }> {
    const privateKey = parsePrivateKey(nsecOrHex);
    const signer = new NDKPrivateKeySigner(privateKey);

    const ndk = new NDK({
        explicitRelayUrls: DEFAULT_RELAYS,
        signer,
    });

    await ndk.connect();

    const dmManager = new DMManager(ndk);

    return { ndk, dmManager };
}

function parsePrivateKey(nsecOrHex: string): string {
    if (nsecOrHex.startsWith("nsec1")) {
        const decoded = nip19.decode(nsecOrHex);
        if (decoded.type !== "nsec") {
            throw new Error("Invalid nsec format");
        }
        return Buffer.from(decoded.data).toString('hex');
    }
    return nsecOrHex;
}

function parseUserIdentifier(npubOrHex: string): string {
    if (npubOrHex.startsWith("npub1")) {
        const decoded = nip19.decode(npubOrHex);
        if (decoded.type !== "npub") {
            throw new Error("Invalid npub format");
        }
        return Buffer.from(decoded.data).toString('hex');
    }
    return npubOrHex;
}

main();
