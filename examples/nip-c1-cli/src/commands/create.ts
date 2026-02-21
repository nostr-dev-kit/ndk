import { Command } from "commander";
import NDK, {
    NDKArticle,
    NDKCollaborativeEvent,
    NDKKind,
    NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { createNDK, success, error, info, log, warn, DEFAULT_RELAYS } from "../utils.js";

export const createCommand = new Command("create")
    .description("Create a new collaborative document")
    .requiredOption("-n, --nsec <nsec>", "Your nsec (private key) for signing")
    .requiredOption("-t, --title <title>", "Title of the document")
    .requiredOption("-c, --content <content>", "Content of the document")
    .option("-a, --author <pubkeys...>", "Additional author pubkeys (npub or hex)")
    .option("-d, --dtag <dtag>", "Custom d-tag identifier (defaults to random)")
    .action(async (options) => {
        try {
            info("Connecting to relays...");
            const ndk = await createNDK(options.nsec);

            const signer = ndk.signer as NDKPrivateKeySigner;
            const user = await signer.user();
            
            info(`Signing as: ${user.npub}`);

            // Create the article (the underlying document)
            const article = new NDKArticle(ndk);
            article.title = options.title;
            article.content = options.content;
            
            // Set d-tag (required for collaborative events)
            if (options.dtag) {
                article.dTag = options.dtag;
            } else {
                article.dTag = `collab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            }

            info(`Creating article with d-tag: ${article.dTag}`);

            // Sign and publish the article first
            await article.sign(signer);
            
            info("Publishing article...");
            const articleRelays = await article.publish();
            success(`Article published to ${articleRelays.size} relays`);

            // Create the collaborative pointer
            const collab = new NDKCollaborativeEvent(ndk);
            
            // Add additional authors if specified
            if (options.author) {
                for (const pubkeyOrNpub of options.author) {
                    let pubkey = pubkeyOrNpub;
                    
                    // Convert npub to hex if needed
                    if (pubkeyOrNpub.startsWith("npub1")) {
                        const decoded = nip19.decode(pubkeyOrNpub);
                        if (decoded.type === "npub") {
                            pubkey = decoded.data;
                        }
                    }
                    
                    collab.authors.push(ndk.getUser({ pubkey }));
                    info(`Added author: ${pubkey.slice(0, 8)}...`);
                }
            }

            // Set up the collaborative event to reference the article
            // (manually set tags instead of using save() to avoid backlink republishing issues)
            collab.dTag = article.dTag;
            collab.targetKind = article.kind;
            
            // Ensure the current user is in authors if not already
            if (!collab.authors.find((a) => a.pubkey === user.pubkey)) {
                collab.authors.push(user);
            }
            
            // Manually sync authors to p-tags (normally done by collab.publish())
            for (const author of collab.authors) {
                collab.tags.push(["p", author.pubkey]);
            }

            // Sign and publish the collaborative pointer
            await collab.sign(signer);
            
            info("Publishing collaborative pointer...");
            // Use super.publish directly to avoid backlink logic, with requiredRelayCount of 0
            const collabRelays = await Object.getPrototypeOf(Object.getPrototypeOf(collab)).publish.call(
                collab,
                undefined,
                undefined, 
                0
            );
            if (collabRelays.size === 0) {
                warn("No relays accepted the collaborative event - this may be a relay limitation");
            } else {
                success(`Collaborative event published to ${collabRelays.size} relays`);
            }
            
            // Now add the backlink to the article and republish
            const pointerAddress = `${NDKKind.CollaborativeEvent}:${collab.pubkey}:${collab.dTag}`;
            if (!article.getMatchingTags("a").some((tag) => tag[1] === pointerAddress)) {
                article.tags.push(["a", pointerAddress]);
                // Re-sign and publish the article with the backlink
                article.sig = undefined;
                article.id = undefined;
                await article.sign(signer);
                info("Republishing article with backlink...");
                try {
                    await article.publishReplaceable(undefined, undefined, 0);
                } catch (e) {
                    // Ignore republish errors - the article was already published successfully
                    info("Note: Backlink republish skipped (original article already published)");
                }
            }

            // Generate the naddr for the collaborative event
            const naddrData = {
                kind: NDKKind.CollaborativeEvent,
                pubkey: collab.pubkey,
                identifier: collab.dTag || "",
                relays: DEFAULT_RELAYS.slice(0, 2),
            };
            const naddr = nip19.naddrEncode(naddrData);

            log("");
            log("=".repeat(60));
            success("Collaborative document created successfully!");
            log("=".repeat(60));
            log("");
            log(`Title: ${options.title}`);
            log(`Authors: ${collab.authorPubkeys.length}`);
            log(`Target Kind: ${collab.targetKind} (Article)`);
            log(`D-tag: ${collab.dTag}`);
            log("");
            log("naddr (save this to fetch/update later):");
            log(naddr);
            log("");

            // Exit cleanly
            process.exit(0);
        } catch (err) {
            error(`Failed to create collaborative document: ${(err as Error).message}`);
            process.exit(1);
        }
    });
