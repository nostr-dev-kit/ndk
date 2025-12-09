import type { NDK } from "../../ndk/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a NIP-51 Interest List (kind:10015).
 * This list contains topics a user is interested in using "t" tags for hashtags.
 * @group Kind Wrapper
 */
export class NDKInterestList extends NDKEvent {
    static kind = NDKKind.InterestList;
    static kinds = [NDKKind.InterestList];

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.InterestList;
    }

    static from(ndkEvent: NDKEvent): NDKInterestList {
        return new NDKInterestList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    /**
     * Get all interest hashtags from the list.
     */
    get interests(): string[] {
        return this.tags
            .filter((tag) => tag[0] === "t")
            .map((tag) => tag[1])
            .filter(Boolean);
    }

    /**
     * Set interest hashtags, replacing all existing ones.
     */
    set interests(hashtags: string[]) {
        this.tags = this.tags.filter((tag) => tag[0] !== "t");
        for (const hashtag of hashtags) {
            this.tags.push(["t", hashtag]);
        }
    }

    /**
     * Add a single interest hashtag to the list.
     * @param hashtag The hashtag to add (without the # symbol)
     */
    addInterest(hashtag: string): void {
        if (!this.hasInterest(hashtag)) {
            this.tags.push(["t", hashtag]);
        }
    }

    /**
     * Remove an interest hashtag from the list.
     * @param hashtag The hashtag to remove
     */
    removeInterest(hashtag: string): void {
        const index = this.tags.findIndex((tag) => tag[0] === "t" && tag[1] === hashtag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    /**
     * Check if the list contains a specific interest hashtag.
     * @param hashtag The hashtag to check for
     */
    hasInterest(hashtag: string): boolean {
        return this.tags.some((tag) => tag[0] === "t" && tag[1] === hashtag);
    }

    /**
     * Get interest set references (kind:30015) from "a" tags.
     */
    get interestSetReferences(): string[] {
        return this.tags
            .filter((tag) => tag[0] === "a")
            .map((tag) => tag[1])
            .filter((ref) => ref?.startsWith("30015:"));
    }
}
