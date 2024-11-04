import type { NDKTag } from "../..";

export type NDKIntervalFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export const possibleIntervalFrequencies: NDKIntervalFrequency[] = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
];

export type NDKSubscriptionAmount = {
    amount: number;
    currency: string;
    term: NDKIntervalFrequency;
};

export function calculateTermDurationInSeconds(term: NDKIntervalFrequency): number {
    switch (term) {
        case "daily":
            return 24 * 60 * 60;
        case "weekly":
            return 7 * 24 * 60 * 60;
        case "monthly":
            return 30 * 24 * 60 * 60;
        case "quarterly":
            return 3 * 30 * 24 * 60 * 60;
        case "yearly":
            return 365 * 24 * 60 * 60;
    }
}

/**
 * Creates a new amount tag
 * @param amount Amount in base unit of the currency (e.g. cents, msats)
 * @param currency Currency code. Use msat for millisatoshis
 * @param term One of daily, weekly, monthly, quarterly, yearly
 * @returns
 */
export function newAmount(amount: number, currency: string, term: NDKIntervalFrequency): NDKTag {
    return ["amount", amount.toString(), currency, term];
}

export function parseTagToSubscriptionAmount(tag: NDKTag): NDKSubscriptionAmount | undefined {
    const amount = parseInt(tag[1]);
    if (isNaN(amount) || amount === undefined || amount === null || amount <= 0) return undefined;

    const currency = tag[2];
    if (currency === undefined || currency === "") return undefined;

    const term = tag[3];
    if (term === undefined) return undefined;
    if (!possibleIntervalFrequencies.includes(term as NDKIntervalFrequency)) return undefined;

    return {
        amount,
        currency,
        term: term as NDKIntervalFrequency,
    };
}
