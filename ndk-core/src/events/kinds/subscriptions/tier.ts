import type { NDK } from "../../../ndk/index.js";
import { type NostrEvent } from "../../index.js";
import type { NDKEvent, NDKTag } from "../../index.js";
import { NDKKind } from "../index.js";
import { NDKArticle } from "../article.js";
import type { NDKIntervalFrequency, NDKSubscriptionAmount } from "./amount.js";
import { newAmount, parseTagToSubscriptionAmount } from "./amount.js";

/**
 * @description
 * Implements NIP-88 (TBD)'s subscription tiers
 *
 * This class will validate that incoming events are valid subscription tiers. Incomplete or invalid
 * amounts will be ignored.
 *
 * @example
 * const tier = new NDKSubscriptionTier;
 * tier.title = "Tier 1";
 * tier.addAmount(100000, "msat", "monthly"); // 100 sats per month
 * tier.addAmount(499, "usd", "monthly"); // $4.99 per month
 * tier.relayUrl = "wss://relay.highlighter.com/";
 * tier.relayUrl = "wss://relay.creator.com/";
 * tier.verifierPubkey = "<pubkey>";
 * tier.addPerk("Access to my private content");
 */
export class NDKSubscriptionTier extends NDKArticle {
    static kind = NDKKind.SubscriptionTier;
    static kinds = [NDKKind.SubscriptionTier];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        const k = rawEvent?.kind ?? NDKKind.SubscriptionTier;
        super(ndk, rawEvent);
        this.kind = k;
    }

    /**
     * Creates a new NDKSubscriptionTier from an event
     * @param event
     * @returns NDKSubscriptionTier
     */
    static from(event: NDKEvent) {
        return new NDKSubscriptionTier(event.ndk, event);
    }

    /**
     * Returns perks for this tier
     */
    get perks(): string[] {
        return this.getMatchingTags("perk")
            .map((tag) => tag[1])
            .filter((perk) => perk !== undefined);
    }

    /**
     * Adds a perk to this tier
     */
    addPerk(perk: string) {
        this.tags.push(["perk", perk]);
    }

    /**
     * Returns the amount for this tier
     */
    get amounts(): NDKSubscriptionAmount[] {
        return this.getMatchingTags("amount")
            .map((tag) => parseTagToSubscriptionAmount(tag))
            .filter((a) => a !== undefined) as NDKSubscriptionAmount[];
    }

    /**
     * Adds an amount to this tier
     * @param amount Amount in the smallest unit of the currency (e.g. cents, msats)
     * @param currency Currency code. Use msat for millisatoshis
     * @param term One of daily, weekly, monthly, quarterly, yearly
     */
    addAmount(amount: number, currency: string, term: NDKIntervalFrequency) {
        this.tags.push(newAmount(amount, currency, term));
    }

    /**
     * Sets a relay where content related to this tier can be found
     * @param relayUrl URL of the relay
     */
    set relayUrl(relayUrl: string) {
        this.tags.push(["r", relayUrl]);
    }

    /**
     * Returns the relay URLs for this tier
     */
    get relayUrls(): string[] {
        return this.getMatchingTags("r")
            .map((tag) => tag[1])
            .filter((relay) => relay !== undefined);
    }

    /**
     * Gets the verifier pubkey for this tier. This is the pubkey that will generate
     * subscription payment receipts
     */
    get verifierPubkey(): string | undefined {
        return this.tagValue("p");
    }

    /**
     * Sets the verifier pubkey for this tier.
     */
    set verifierPubkey(pubkey: string | undefined) {
        this.removeTag("p");
        if (pubkey) this.tags.push(["p", pubkey]);
    }

    /**
     * Checks if this tier is valid
     */
    get isValid(): boolean {
        return (
            this.title !== undefined && // Must have a title
            this.amounts.length > 0 // Must have at least one amount
        );
    }
}
