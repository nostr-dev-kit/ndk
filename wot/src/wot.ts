import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import createDebug from "debug";

const d = createDebug("ndk-wot");

export interface WoTNode {
    pubkey: string;
    depth: number;
    followedBy: Set<string>;
}

export interface WoTBuildOptions {
    /** Maximum depth to traverse (hops from root user) */
    depth: number;

    /** Maximum number of follows to process per user */
    maxFollows?: number;

    /** Timeout for building the graph in ms */
    timeout?: number;
}

export class NDKWoT {
    private ndk: NDK;
    private rootPubkey: string;
    private nodes: Map<string, WoTNode> = new Map();
    private loaded = false;

    constructor(ndk: NDK, rootPubkey: string) {
        if (!this.isValidPubkey(rootPubkey)) {
            throw new Error(`Invalid root pubkey: ${rootPubkey}`);
        }

        this.ndk = ndk;
        this.rootPubkey = rootPubkey;

        // Add root node
        this.nodes.set(rootPubkey, {
            pubkey: rootPubkey,
            depth: 0,
            followedBy: new Set(),
        });
    }

    /**
     * Build the WOT graph
     */
    async load(options: WoTBuildOptions): Promise<void> {
        const { depth, maxFollows = 1000, timeout } = options;

        d("Building WOT graph for %s with depth %d", this.rootPubkey, depth);

        const startTime = Date.now();
        const processedUsers = new Set<string>();

        // Process users level by level
        for (let currentDepth = 0; currentDepth < depth; currentDepth++) {
            if (timeout && Date.now() - startTime > timeout) {
                d("Timeout reached while building WOT graph");
                break;
            }

            // Get all users at current depth
            const usersAtDepth = Array.from(this.nodes.values())
                .filter((node) => node.depth === currentDepth)
                .map((node) => node.pubkey);

            if (usersAtDepth.length === 0) break;

            d("Processing %d users at depth %d", usersAtDepth.length, currentDepth);

            // Fetch follows for all users at this depth
            const followEvents = await this.ndk.fetchEvents({
                kinds: [NDKKind.Contacts],
                authors: usersAtDepth,
            });

            for (const event of followEvents) {
                if (processedUsers.has(event.pubkey)) continue;
                processedUsers.add(event.pubkey);

                const follows = this.extractFollows(event);
                const limitedFollows = follows.slice(0, maxFollows);

                // Add followed users to graph
                for (const followedPubkey of limitedFollows) {
                    let node = this.nodes.get(followedPubkey);

                    if (!node) {
                        // New node
                        node = {
                            pubkey: followedPubkey,
                            depth: currentDepth + 1,
                            followedBy: new Set([event.pubkey]),
                        };
                        this.nodes.set(followedPubkey, node);
                    } else {
                        // Existing node - update if we found a shorter path
                        if (currentDepth + 1 < node.depth) {
                            node.depth = currentDepth + 1;
                        }
                        node.followedBy.add(event.pubkey);
                    }
                }
            }
        }

        this.loaded = true;
        d("WOT graph built with %d nodes in %dms", this.nodes.size, Date.now() - startTime);
    }

    /**
     * Validate if a string is a valid pubkey (64 char hex)
     */
    private isValidPubkey(pubkey: string): boolean {
        return /^[0-9a-f]{64}$/i.test(pubkey);
    }

    /**
     * Extract pubkeys from a contacts list event
     */
    private extractFollows(event: NDKEvent): string[] {
        const follows: string[] = [];

        for (const tag of event.tags) {
            if (tag[0] === "p") {
                const pubkey = tag[1];
                // Only add if pubkey exists and is valid 64-char hex
                if (pubkey && typeof pubkey === "string" && this.isValidPubkey(pubkey)) {
                    follows.push(pubkey);
                } else if (pubkey) {
                    d("Skipping invalid p-tag pubkey: %s", pubkey);
                }
            }
        }

        return follows;
    }

    /**
     * Get WOT score for a pubkey (lower depth = higher score)
     */
    getScore(pubkey: string): number {
        const node = this.nodes.get(pubkey);
        if (!node) return 0;

        // Simple inverse depth score (1.0 at depth 0, 0.5 at depth 1, etc.)
        return 1 / (node.depth + 1);
    }

    /**
     * Get distance (depth) for a pubkey
     */
    getDistance(pubkey: string): number | null {
        const node = this.nodes.get(pubkey);
        return node ? node.depth : null;
    }

    /**
     * Check if pubkey is in WOT
     */
    includes(pubkey: string, options?: { maxDepth?: number }): boolean {
        const node = this.nodes.get(pubkey);
        if (!node) return false;

        if (options?.maxDepth !== undefined) {
            return node.depth <= options.maxDepth;
        }

        return true;
    }

    /**
     * Get all pubkeys in WOT
     */
    getAllPubkeys(options?: { maxDepth?: number }): string[] {
        let nodes = Array.from(this.nodes.values());

        if (options?.maxDepth !== undefined) {
            const maxDepth = options.maxDepth;
            nodes = nodes.filter((node) => node.depth <= maxDepth);
        }

        return nodes.map((node) => node.pubkey);
    }

    /**
     * Get scores for multiple pubkeys
     */
    getScores(pubkeys: string[]): Map<string, number> {
        const scores = new Map<string, number>();

        for (const pubkey of pubkeys) {
            scores.set(pubkey, this.getScore(pubkey));
        }

        return scores;
    }

    /**
     * Get the WOT node for a pubkey
     */
    getNode(pubkey: string): WoTNode | null {
        return this.nodes.get(pubkey) || null;
    }

    /**
     * Check if WOT graph has been loaded
     */
    isLoaded(): boolean {
        return this.loaded;
    }

    /**
     * Get total number of nodes in the graph
     */
    get size(): number {
        return this.nodes.size;
    }
}
