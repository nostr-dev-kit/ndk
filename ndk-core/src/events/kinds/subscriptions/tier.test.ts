import { NDKKind } from "../index.js";
import { type NostrEvent } from "../..";
import { NDKSubscriptionTier } from "./tier";

describe("NDKSubscriptionTier", () => {
    describe("isValid", () => {
        it("marks tiers without an amount as invalid", () => {
            const tier = new NDKSubscriptionTier(undefined, {
                kind: NDKKind.SubscriptionTier,
                tags: [["title", "Tier 1"]],
            } as NostrEvent);
            expect(tier.isValid).toBe(false);
        });

        it("marks as valid tiers with an amount", () => {
            const tier = new NDKSubscriptionTier(undefined, {
                kind: NDKKind.SubscriptionTier,
                tags: [["title", "Tier 1"]],
            } as NostrEvent);
            tier.addAmount(100000, "msat", "monthly");
            expect(tier.isValid).toBe(true);
        });
    });

    describe(".amounts", () => {
        it("ignores amounts without amount", () => {
            const tier = new NDKSubscriptionTier(undefined, {
                kind: NDKKind.SubscriptionTier,
                tags: [
                    ["title", "Tier 1"],
                    ["amount", ""],
                    ["amount", "invalid"],
                ],
            } as NostrEvent);
            expect(tier.amounts.length).toBe(0);
        });

        it("ignores amounts without currency", () => {
            const tier = new NDKSubscriptionTier(undefined, {
                kind: NDKKind.SubscriptionTier,
                tags: [
                    ["title", "Tier 1"],
                    ["amount", "1000", ""],
                    ["amount", "1000", "invalid"],
                ],
            } as NostrEvent);
            expect(tier.amounts.length).toBe(0);
        });

        it("ignores amounts with invalid terms", () => {
            const tier = new NDKSubscriptionTier(undefined, {
                kind: NDKKind.SubscriptionTier,
                tags: [
                    ["title", "Tier 1"],
                    ["amount", "1000", "msat", ""],
                    ["amount", "1000", "msat", "minutes"],
                ],
            } as NostrEvent);
            expect(tier.amounts.length).toBe(0);
        });

        it("parses valid amounts", () => {
            const tier = new NDKSubscriptionTier(undefined, {
                kind: NDKKind.SubscriptionTier,
                tags: [
                    ["title", "Tier 1"],
                    ["amount", "499", "usd", "monthly"],
                    ["amount", "1000", "msat", "yearly"],
                    ["amount", "1000", "msat", "weekly"],
                    ["amount", "1000", "msat", "daily"],
                ],
            } as NostrEvent);
            expect(tier.amounts.length).toBe(4);
        });
    });
});
