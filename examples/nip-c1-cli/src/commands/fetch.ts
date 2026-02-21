import { Command } from "commander";
import {
    NDKCollaborativeEvent,
    NDKKind,
    NDKArticle,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import {
    createNDK,
    success,
    error,
    info,
    log,
    warn,
    formatTimestamp,
    truncate,
} from "../utils.js";

export const fetchCommand = new Command("fetch")
    .description("Fetch and display a collaborative document")
    .argument("<naddr>", "The naddr of the collaborative document")
    .action(async (naddr) => {
        try {
            info("Decoding naddr...");
            
            const decoded = nip19.decode(naddr);
            if (decoded.type !== "naddr") {
                throw new Error("Invalid naddr format. Expected naddr1...");
            }
            
            const { kind, pubkey, identifier, relays } = decoded.data as {
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

            info(`Fetching collaborative event: ${identifier}`);

            // Fetch the collaborative pointer event
            const collabEvent = await ndk.fetchEvent({
                kinds: [NDKKind.CollaborativeEvent],
                authors: [pubkey],
                "#d": [identifier],
            });

            if (!collabEvent) {
                throw new Error("Collaborative event not found");
            }

            const collab = NDKCollaborativeEvent.from(collabEvent);
            // Ensure ndk is set for author parsing
            collab.ndk = ndk;
            
            // Debug: Check p-tags
            const pTags = collabEvent.getMatchingTags("p");
            if (pTags.length === 0) {
                warn("No p-tags found in collaborative event - this may indicate an issue with publishing");
            }
            
            // Manually parse authors if they weren't parsed
            if (collab.authors.length === 0 && pTags.length > 0) {
                for (const pTag of pTags) {
                    collab.authors.push(ndk.getUser({ pubkey: pTag[1] }));
                }
            }
            
            success("Found collaborative event!");

            log("");
            log("=".repeat(60));
            log("COLLABORATIVE DOCUMENT INFO");
            log("=".repeat(60));
            log("");
            log(`Pointer Event ID: ${collab.id?.slice(0, 16)}...`);
            log(`D-tag: ${collab.dTag}`);
            log(`Target Kind: ${collab.targetKind}`);
            log(`Created: ${formatTimestamp(collab.created_at)}`);
            log("");
            log("Authors:");
            for (const author of collab.authors) {
                const npub = nip19.npubEncode(author.pubkey);
                log(`  - ${npub.slice(0, 20)}... (${author.pubkey.slice(0, 8)}...)`);
            }

            // Now fetch the actual content from the authors
            info("Fetching latest version from authors...");

            // Start the collaborative subscription to get the latest version
            collab.start();

            // Wait for events to come in
            await new Promise((resolve) => setTimeout(resolve, 3000));

            collab.stop();

            const currentVersion = collab.currentVersion;

            if (currentVersion) {
                log("");
                log("=".repeat(60));
                log("CURRENT CONTENT");
                log("=".repeat(60));
                log("");

                // Try to parse as article if it's kind 30023
                if (currentVersion.kind === NDKKind.Article) {
                    const article = NDKArticle.from(currentVersion);
                    log(`Title: ${article.title || "(no title)"}`);
                    log(`Author: ${nip19.npubEncode(article.pubkey).slice(0, 20)}...`);
                    log(`Last Updated: ${formatTimestamp(article.created_at)}`);
                    log("");
                    log("Content:");
                    log("-".repeat(40));
                    log(article.content || "(no content)");
                    log("-".repeat(40));
                } else {
                    log(`Kind: ${currentVersion.kind}`);
                    log(`Author: ${nip19.npubEncode(currentVersion.pubkey).slice(0, 20)}...`);
                    log(`Last Updated: ${formatTimestamp(currentVersion.created_at)}`);
                    log("");
                    log("Content:");
                    log("-".repeat(40));
                    log(currentVersion.content || "(no content)");
                    log("-".repeat(40));
                }
            } else {
                info("No content versions found yet");
            }

            log("");

            // Exit cleanly
            process.exit(0);
        } catch (err) {
            error(`Failed to fetch collaborative document: ${(err as Error).message}`);
            process.exit(1);
        }
    });
