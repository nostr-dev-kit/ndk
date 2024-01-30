import type { NDK } from "../../../ndk/index.js";
import { type NostrEvent } from "../../index.js";
import type { NDKTag } from "../../index.js";
import { NDKKind } from "../index.js";
import { NDKArticle } from "../article.js";

export type NDKIntervalFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const possibleIntervalFrequencies: NDKIntervalFrequency[] = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
];

export type NDKSubscriptionTierAmount = {
    amount: number;
    currency: string;
    term: NDKIntervalFrequency;
};

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
 * tier.addPerk("Access to my private content");
 */
export class NDKSubscriptionTier extends NDKArticle {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.SubscriptionTier;
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
    get amounts(): NDKSubscriptionTierAmount[] {
        return this.getMatchingTags("amount")
            .map((tag) => convertAmountTagToAmount(tag))
            .filter(
                (amount: NDKSubscriptionTierAmount | undefined) => amount !== undefined
            ) as NDKSubscriptionTierAmount[];
    }

    /**
     * Adds an amount to this tier
     * @param amount Amount in the smallest unit of the currency (e.g. cents, msats)
     * @param currency Currency code. Use msat for millisatoshis
     * @param term One of daily, weekly, monthly, quarterly, yearly
     */
    addAmount(amount: number, currency: string, term: NDKIntervalFrequency) {
        this.tags.push(["amount", amount.toString(), currency, term]);
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
     * Checks if this tier is valid
     */
    get isValid(): boolean {
        return this.amounts.length > 0;
    }
}

export function convertAmountTagToAmount(tag: NDKTag): NDKSubscriptionTierAmount | undefined {
    const amount = parseInt(tag[1]);
    if (isNaN(amount) || amount === undefined || amount === null || amount < 0) return undefined;

    const currency = tag[2];
    if (currency === undefined) return undefined;

    const term = tag[3];
    if (term === undefined) return undefined;
    if (!possibleIntervalFrequencies.includes(term as NDKIntervalFrequency)) return undefined;

    return {
        amount,
        currency,
        term: term as NDKIntervalFrequency,
    };
}
