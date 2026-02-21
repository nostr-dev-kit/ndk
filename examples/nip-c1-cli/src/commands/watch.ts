import { Command } from "commander";
import {
    NDKCollaborativeEvent,
    NDKKind,
    NDKArticle,
    NDKEvent,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import {
    createNDK,
    success,
    error,
    info,
    log,
    formatTimestamp,
    truncate,
} from "../utils.js";

export const watchCommand = new Command("watch")
    .description("Subscribe to real-time updates on a collaborative document")
    .argument("<naddr>", "The naddr of the collaborative document")
    .action(async (naddr) => {
        try {
            info("Decoding naddr...");
            
            const decoded = nip19.decode(naddr);
            if (decoded.type !== "naddr") {
                throw new Error("Invalid naddr format. Expected naddr1...");
            }
            
            const { kind, pubkey, identifier } = decoded.data as {
                kind: number;
                pubkey: string;
                identifier: string;
                relays?: string[];
            };

            if (kind !== NDKKind.CollaborativeEvent) {
                throw new Error(
                    `Invalid kind ${kind}. Expected ${NDKKind.CollaborativeEvent} (CollaborativeEvent)`
                );
            }

            info("Connecting to relays...");
            const ndk = await createNDK();

            // Fetch the collaborative pointer event
            info("Fetching collaborative event...");
            const collabEvent = await ndk.fetchEvent({
                kinds: [NDKKind.CollaborativeEvent],
                authors: [pubkey],
                "#d": [identifier],
            });

            if (!collabEvent) {
                throw new Error("Collaborative event not found");
            }

            const collab = NDKCollaborativeEvent.from(collabEvent);
            success("Found collaborative event!");

            log("");
            log("=".repeat(60));
            log("WATCHING FOR UPDATES");
            log("=".repeat(60));
            log("");
            log(`D-tag: ${collab.dTag}`);
            log(`Target Kind: ${collab.targetKind}`);
            log(`Authors: ${collab.authorPubkeys.length}`);
            log("");
            log("Watching for updates... (Press Ctrl+C to stop)");
            log("-".repeat(60));
            log("");

            let eventCount = 0;

            // Register update callback before starting
            collab.onUpdate((event: NDKEvent) => {
                eventCount++;
                const timestamp = formatTimestamp(event.created_at);
                const authorNpub = nip19.npubEncode(event.pubkey);
                
                log(`[${timestamp}] Update #${eventCount}`);
                log(`  Author: ${authorNpub.slice(0, 20)}...`);

                if (event.kind === NDKKind.Article) {
                    const article = NDKArticle.from(event);
                    log(`  Title: ${article.title || "(no title)"}`);
                    log(`  Content preview: ${truncate(article.content || "(empty)", 80)}`);
                } else {
                    log(`  Kind: ${event.kind}`);
                    log(`  Content preview: ${truncate(event.content || "(empty)", 80)}`);
                }

                // Show if this is the new best version
                if (collab.currentVersion?.id === event.id) {
                    log(`  ★ This is now the latest version`);
                }

                log("");
            });

            // Start the subscription
            collab.start();

            // Keep the process running
            await new Promise(() => {
                // This promise never resolves - we wait for Ctrl+C
                process.on("SIGINT", async () => {
                    log("");
                    info("Stopping watch...");
                    collab.stop();
                    // Pool cleanup happens on exit
                    
                    log("");
                    log(`Received ${eventCount} update(s) while watching.`);
                    process.exit(0);
                });
            });
        } catch (err) {
            error(`Failed to watch collaborative document: ${(err as Error).message}`);
            process.exit(1);
        }
    });
