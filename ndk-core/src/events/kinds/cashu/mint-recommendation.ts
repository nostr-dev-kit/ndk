import type { NDK } from "../../../ndk/index.js";
import { NDKEvent, type NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * NIP-87: Ecash Mint Recommendation Event (kind 38000)
 *
 * Allows users to recommend and review ecash mints.
 * This is a parameterized-replaceable event so users can edit their recommendations.
 */
export class NDKMintRecommendation extends NDKEvent {
    static kind = NDKKind.EcashMintRecommendation;
    static kinds = [NDKKind.EcashMintRecommendation];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.EcashMintRecommendation;
    }

    static async from(event: NDKEvent): Promise<NDKMintRecommendation | undefined> {
        const recommendation = new NDKMintRecommendation(event.ndk, event);
        return recommendation;
    }

    /**
     * Event kind being recommended (38173 for Fedimint or 38172 for Cashu)
     */
    get recommendedKind(): number | undefined {
        const value = this.tagValue("k");
        return value ? Number(value) : undefined;
    }

    set recommendedKind(value: number | undefined) {
        this.removeTag("k");
        if (value) this.tags.push(["k", value.toString()]);
    }

    /**
     * Identifier for the recommended mint event
     */
    get identifier(): string | undefined {
        return this.tagValue("d");
    }

    set identifier(value: string | undefined) {
        this.removeTag("d");
        if (value) this.tags.push(["d", value]);
    }

    /**
     * Mint connection URLs/invite codes (multiple allowed)
     */
    get urls(): string[] {
        return this.getMatchingTags("u").map((t) => t[1]);
    }

    set urls(values: string[]) {
        this.removeTag("u");
        for (const value of values) {
            this.tags.push(["u", value]);
        }
    }

    /**
     * Pointers to specific mint events
     * Returns array of {kind, identifier, relay} objects
     */
    get mintEventPointers(): Array<{ kind: number; identifier: string; relay?: string }> {
        return this.getMatchingTags("a").map((t) => ({
            kind: Number(t[1].split(":")[0]),
            identifier: t[1].split(":")[2],
            relay: t[2],
        }));
    }

    /**
     * Add a pointer to a specific mint event
     */
    addMintEventPointer(kind: number, pubkey: string, identifier: string, relay?: string): void {
        const aTag = [`a`, `${kind}:${pubkey}:${identifier}`];
        if (relay) aTag.push(relay);
        this.tags.push(aTag as [string, string] | [string, string, string]);
    }

    /**
     * Review/recommendation text
     */
    get review(): string {
        return this.content;
    }

    set review(value: string) {
        this.content = value;
    }
}
