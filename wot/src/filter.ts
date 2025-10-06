import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKWoT } from "./wot.js";
import createDebug from "debug";

const d = createDebug("ndk-wot:filter");

export interface WoTFilterOptions {
    /** Maximum depth to include (distance from root user) */
    maxDepth?: number;

    /** Minimum WOT score to include (0-1) */
    minScore?: number;

    /** Include events from users not in WOT */
    includeUnknown?: boolean;
}

export interface WoTRankOptions {
    /** Ranking algorithm to use */
    algorithm?: "distance" | "score" | "followers";

    /** Place unknown users at the end */
    unknownsLast?: boolean;

    /** Custom comparator function */
    comparator?: (a: NDKEvent, b: NDKEvent) => number;
}

/**
 * Filter events based on WOT
 */
export function filterByWoT(wot: NDKWoT, events: NDKEvent[], options: WoTFilterOptions = {}): NDKEvent[] {
    const { maxDepth, minScore, includeUnknown = false } = options;

    return events.filter((event) => {
        const pubkey = event.pubkey;

        // Check if in WOT
        const inWoT = wot.includes(pubkey, { maxDepth });

        if (!inWoT) {
            return includeUnknown;
        }

        // Check score if specified
        if (minScore !== undefined) {
            const score = wot.getScore(pubkey);
            return score >= minScore;
        }

        return true;
    });
}

/**
 * Rank events based on WOT
 */
export function rankByWoT(wot: NDKWoT, events: NDKEvent[], options: WoTRankOptions = {}): NDKEvent[] {
    const { algorithm = "distance", unknownsLast = false, comparator } = options;

    // Use custom comparator if provided
    if (comparator) {
        return [...events].sort(comparator);
    }

    // Built-in ranking algorithms
    return [...events].sort((a, b) => {
        const aPubkey = a.pubkey;
        const bPubkey = b.pubkey;

        const aInWoT = wot.includes(aPubkey);
        const bInWoT = wot.includes(bPubkey);

        // Handle unknowns
        if (unknownsLast) {
            if (!aInWoT && bInWoT) return 1;
            if (aInWoT && !bInWoT) return -1;
            if (!aInWoT && !bInWoT) return 0;
        }

        // Both in WOT, rank by algorithm
        switch (algorithm) {
            case "distance": {
                const aDistance = wot.getDistance(aPubkey) ?? Infinity;
                const bDistance = wot.getDistance(bPubkey) ?? Infinity;
                return aDistance - bDistance; // Lower distance = higher rank
            }

            case "score": {
                const aScore = wot.getScore(aPubkey);
                const bScore = wot.getScore(bPubkey);
                return bScore - aScore; // Higher score = higher rank
            }

            case "followers": {
                const aNode = wot.getNode(aPubkey);
                const bNode = wot.getNode(bPubkey);
                const aFollowers = aNode?.followedBy.size ?? 0;
                const bFollowers = bNode?.followedBy.size ?? 0;
                return bFollowers - aFollowers; // More followers = higher rank
            }

            default:
                return 0;
        }
    });
}

/**
 * Create a comparator function for sorting events by WOT
 */
export function createWoTComparator(wot: NDKWoT, options: WoTRankOptions = {}): (a: NDKEvent, b: NDKEvent) => number {
    const { algorithm = "distance", unknownsLast = false } = options;

    return (a: NDKEvent, b: NDKEvent) => {
        const aPubkey = a.pubkey;
        const bPubkey = b.pubkey;

        const aInWoT = wot.includes(aPubkey);
        const bInWoT = wot.includes(bPubkey);

        // Handle unknowns
        if (unknownsLast) {
            if (!aInWoT && bInWoT) return 1;
            if (aInWoT && !bInWoT) return -1;
            if (!aInWoT && !bInWoT) return 0;
        }

        // Both in WOT, rank by algorithm
        switch (algorithm) {
            case "distance": {
                const aDistance = wot.getDistance(aPubkey) ?? Infinity;
                const bDistance = wot.getDistance(bPubkey) ?? Infinity;
                return aDistance - bDistance;
            }

            case "score": {
                const aScore = wot.getScore(aPubkey);
                const bScore = wot.getScore(bPubkey);
                return bScore - aScore;
            }

            case "followers": {
                const aNode = wot.getNode(aPubkey);
                const bNode = wot.getNode(bPubkey);
                const aFollowers = aNode?.followedBy.size ?? 0;
                const bFollowers = bNode?.followedBy.size ?? 0;
                return bFollowers - aFollowers;
            }

            default:
                return 0;
        }
    };
}
