import { nip19 } from "nostr-tools";
import type { EventPointer } from "nostr-tools/lib/nip19.js";

import { NDKRelay } from "../relay/index.js";
import type { NDKFilter, NDKSubscription } from "./index.js";

/**
 * Don't generate subscription Ids longer than this amount of characters
 * (plus 4-chars random number)
 */
const MAX_SUBID_LENGTH = 20;

/**
 * Checks if a subscription is fully guaranteed to have been filled.
 *
 * This is useful to determine if a cache hit fully satisfies a subscription.
 *
 * @param subscription
 * @returns
 */
export function queryFullyFilled(subscription: NDKSubscription): boolean {
    if (filterIncludesIds(subscription.filter)) {
        if (resultHasAllRequestedIds(subscription)) {
            return true;
        }
    }

    return false;
}

/**
 * Compares whether a filter includes another filter.
 * @param filter1 Filter to compare from
 * @param filter2 Filter to compare to
 * @example
 * const filter1 = { authors: ["a", "b"] };
 * const filter2 = { authors: ["a", "b", "c"] };
 * compareFilter(filter1, filter2); // true
 *
 * const filter1 = { authors: ["a", "b"] };
 * const filter2 = { authors: ["a", "c"] };
 * compareFilter(filter1, filter2); // false
 * @returns
 */
export function compareFilter(filter1: NDKFilter, filter2: NDKFilter) {
    // Make sure the filters have the same number of keys
    if (Object.keys(filter1).length !== Object.keys(filter2).length) return false;

    for (const [key, value] of Object.entries(filter1)) {
        const valuesInFilter2 = filter2[key as keyof NDKFilter] as string[];

        if (!valuesInFilter2) return false;

        if (Array.isArray(value) && Array.isArray(valuesInFilter2)) {
            const v: string[] = value as string[];
            // make sure all values in the filter are in the other filter
            for (const valueInFilter2 of valuesInFilter2) {
                const val: string = valueInFilter2 as string;
                if (!v.includes(val)) {
                    return false;
                }
            }
        } else {
            if (valuesInFilter2 !== value) return false;
        }
    }

    return true;
}

function filterIncludesIds(filter: NDKFilter): boolean {
    return !!filter["ids"];
}

function resultHasAllRequestedIds(subscription: NDKSubscription): boolean {
    const ids = subscription.filter["ids"];

    return !!ids && ids.length === subscription.eventFirstSeen.size;
}

/**
 * Generates a subscription ID based on the subscriptions and filter.
 *
 * When some of the subscriptions specify a subId, those are used,
 * joining them with a comma.
 *
 * If none of the subscriptions specify a subId, a subId is generated
 * by joining all the filter keys, and expanding the kinds with the requested kinds.
 */
export function generateSubId(subscriptions: NDKSubscription[], filters: NDKFilter[]): string {
    const subIds = subscriptions.map((sub) => sub.subId).filter(Boolean);
    const subIdParts: string[] = [];
    const filterNonKindKeys = new Set<string>();
    const filterKinds = new Set<number>();

    if (subIds.length > 0) {
        subIdParts.push(Array.from(new Set(subIds)).join(","));
    } else {
        for (const filter of filters) {
            for (const key of Object.keys(filter)) {
                if (key === "kinds") {
                    filter.kinds?.forEach((k) => filterKinds.add(k));
                } else {
                    filterNonKindKeys.add(key);
                }
            }
        }

        if (filterKinds.size > 0) {
            subIdParts.push("kinds:" + Array.from(filterKinds).join(","));
        }

        if (filterNonKindKeys.size > 0) {
            subIdParts.push(Array.from(filterNonKindKeys).join(","));
        }
    }

    let subId = subIdParts.join("-");
    if (subId.length > MAX_SUBID_LENGTH) subId = subId.substring(0, MAX_SUBID_LENGTH);

    if (subIds.length !== 1) {
        // Add the random string to the resulting subId
        subId += "-" + Math.floor(Math.random() * 999).toString();
    }

    return subId;
}

/**
 * Creates a valid nostr filter from an event id or a NIP-19 bech32.
 */
export function filterFromId(id: string): NDKFilter {
    let decoded;

    if (id.match(NIP33_A_REGEX)) {
        const [kind, pubkey, identifier] = id.split(":");

        const filter: NDKFilter = {
            authors: [pubkey],
            kinds: [parseInt(kind)],
        };

        if (identifier) {
            filter["#d"] = [identifier];
        }

        return filter;
    }

    try {
        decoded = nip19.decode(id);

        switch (decoded.type) {
            case "nevent":
                return { ids: [decoded.data.id] };
            case "note":
                return { ids: [decoded.data] };
            case "naddr":
                return {
                    authors: [decoded.data.pubkey],
                    "#d": [decoded.data.identifier],
                    kinds: [decoded.data.kind],
                };
        }
    } catch (e) {
        // Empty
    }

    return { ids: [id] };
}

export function isNip33AValue(value: string): boolean {
    return value.match(NIP33_A_REGEX) !== null;
}

/**
 * Matches an `a` tag of a NIP-33 (kind:pubkey:[identifier])
 */
export const NIP33_A_REGEX = /^(\d+):([0-9A-Fa-f]+)(?::(.*))?$/;

/**
 * Returns the specified relays from a NIP-19 bech32.
 *
 * @param bech32 The NIP-19 bech32.
 */
export function relaysFromBech32(bech32: string): NDKRelay[] {
    try {
        const decoded = nip19.decode(bech32);

        if (["naddr", "nevent"].includes(decoded?.type)) {
            const data = decoded.data as unknown as EventPointer;

            if (data?.relays) {
                return data.relays.map((r: string) => new NDKRelay(r));
            }
        }
    } catch (e) {
        /* empty */
    }

    return [];
}
