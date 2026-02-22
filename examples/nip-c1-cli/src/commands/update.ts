import { Command } from "commander";
import {
    NDKCollaborativeEvent,
    NDKKind,
    NDKArticle,
    NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { createNDK, success, error, info, log, warn } from "../utils.js";

export const updateCommand = new Command("update")
    .description("Update a collaborative document (must be an authorized author)")
    .argument("<naddr>", "The naddr of the collaborative document")
    .requiredOption("-n, --nsec <nsec>", "Your nsec (private key) for signing")
    .option("-t, --title <title>", "New title (optional)")
    .option("-c, --content <content>", "New content (optional)")
    .action(async (naddr, options) => {
        try {
            if (!options.title && !options.content) {
                throw new Error("Must provide at least --title or --content to update");
            }

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
            const ndk = await createNDK(options.nsec);

            const signer = ndk.signer as NDKPrivateKeySigner;
            const user = await signer.user();
            
            info(`Signing as: ${user.npub.slice(0, 20)}...`);

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

            // Check if user is an authorized author
            const isAuthor = collab.authorPubkeys.includes(user.pubkey);
            if (!isAuthor) {
                error("You are not an authorized author of this collaborative document");
                log("");
                log("Authorized authors:");
                for (const authorPubkey of collab.authorPubkeys) {
                    log(`  - ${nip19.npubEncode(authorPubkey).slice(0, 20)}...`);
                }
                process.exit(1);
            }

            success("You are an authorized author");

            // Fetch the current version
            info("Fetching current version...");
            collab.start();
            await new Promise((resolve) => setTimeout(resolve, 3000));
            collab.stop();

            const currentVersion = collab.currentVersion;

            // Create a new article with updates
            const newArticle = new NDKArticle(ndk);
            newArticle.dTag = identifier; // Must match the collaborative d-tag

            if (currentVersion && currentVersion.kind === NDKKind.Article) {
                const oldArticle = NDKArticle.from(currentVersion);
                // Preserve existing values if not updating
                newArticle.title = options.title || oldArticle.title;
                newArticle.content = options.content || oldArticle.content;
                
                log("");
                if (options.title) {
                    log(`Title: "${oldArticle.title}" -> "${newArticle.title}"`);
                }
                if (options.content) {
                    log(`Content updated (${options.content.length} chars)`);
                }
            } else {
                // No previous version, create new
                newArticle.title = options.title || "Untitled";
                newArticle.content = options.content || "";
                
                if (!currentVersion) {
                    warn("No previous version found, creating new content");
                }
            }

            // Sign and publish the new version
            info("Publishing updated version...");
            await newArticle.sign(signer);
            const relays = await newArticle.publish();
            
            success(`Update published to ${relays.size} relays`);
            log("");
            log("=".repeat(60));
            log("UPDATE SUCCESSFUL");
            log("=".repeat(60));
            log("");
            log(`Title: ${newArticle.title}`);
            log(`Content: ${(newArticle.content || "").slice(0, 100)}${(newArticle.content || "").length > 100 ? "..." : ""}`);
            log(`Event ID: ${newArticle.id?.slice(0, 16)}...`);
            log("");

            // Exit cleanly
            process.exit(0);
        } catch (err) {
            error(`Failed to update collaborative document: ${(err as Error).message}`);
            process.exit(1);
        }
    });
