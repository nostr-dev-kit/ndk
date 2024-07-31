import { nip19 } from "nostr-tools";

import { NDKRelay } from "../relay/index.js";
import type { NDKFilter, NDKSubscription } from "./index.js";
import type { EventPointer } from "../user/index.js";
import type { NDK } from "../ndk/index.js";

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

    // Add the random string to the resulting subId
    subId += "-" + Math.floor(Math.random() * 999).toString();

    return subId;
}

/**
 * Creates a valid nostr filter to REQ events that are tagging a NIP-19 bech32
 * @param id Bech32 of the event
 * @example
 * const bech32 = "nevent1qgs9kqvr4dkruv3t7n2pc6e6a7v9v2s5fprmwjv4gde8c4fe5y29v0spzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqype6ycavy2e9zpx9mzeuekaahgw96ken0mzkcmgz40ljccwyrn88gxv2ewr"
 * const filter = filterForEventsTaggingId(bech32);
 * // filter => { "#e": [<id>] }
 *
 * @example
 * const bech32 = "naddr1qvzqqqr4gupzpjjwt0eqm6as279wf079c0j42jysp2t4s37u8pg5w2dfyktxgkntqqxnzde38yen2desxqmn2d3332u3ff";
 * const filter = filterForEventsTaggingId(bech32);
 * // filter => { "#a": ["30023:ca4e5bf20debb0578ae4bfc5c3e55548900a975847dc38514729a92596645a6b:1719357007561"]}
 */
export function filterForEventsTaggingId(id: string): NDKFilter | undefined {
    try {
        const decoded = nip19.decode(id);

        switch (decoded.type) {
            case "naddr":
                return {
                    "#a": [
                        `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`,
                    ],
                };
            case "nevent":
                return { "#e": [decoded.data.id] };
            case "note":
                return { "#e": [decoded.data] };
            case "nprofile":
                return { "#p": [decoded.data.pubkey] };
            case "npub":
                return { "#p": [decoded.data] };
        }
    } catch {}
}

/**
 * Creates a valid nostr filter from an event id or a NIP-19 bech32.
 *
 * @example
 * const bech32 = "nevent1qgs9kqvr4dkruv3t7n2pc6e6a7v9v2s5fprmwjv4gde8c4fe5y29v0spzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqype6ycavy2e9zpx9mzeuekaahgw96ken0mzkcmgz40ljccwyrn88gxv2ewr"
 * const filter = filterFromBech32(bech32);
 * // filter => { ids: [...], authors: [...] }
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

    if (id.match(BECH32_REGEX)) {
        try {
            decoded = nip19.decode(id);

            switch (decoded.type) {
                case "nevent": {
                    const filter: NDKFilter = { ids: [decoded.data.id] };
                    if (decoded.data.author) filter.authors = [decoded.data.author];
                    if (decoded.data.kind) filter.kinds = [decoded.data.kind];
                    return filter;
                }
                case "note":
                    return { ids: [decoded.data] };
                case "naddr":
                    const filter: NDKFilter = {
                        authors: [decoded.data.pubkey],
                        kinds: [decoded.data.kind],
                    };

                    if (decoded.data.identifier) filter["#d"] = [decoded.data.identifier];

                    return filter;
            }
        } catch (e) {
            console.error("Error decoding", id, e);
            // Empty
        }
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

export const BECH32_REGEX = /^n(event|ote|profile|pub|addr)1[\d\w]+$/;

/**
 * Returns the specified relays from a NIP-19 bech32.
 *
 * @param bech32 The NIP-19 bech32.
 */
export function relaysFromBech32(bech32: string, ndk?: NDK): NDKRelay[] {
    try {
        const decoded = nip19.decode(bech32);

        if (["naddr", "nevent"].includes(decoded?.type)) {
            const data = decoded.data as unknown as EventPointer;

            if (data?.relays) {
                return data.relays.map(
                    (r: string) => new NDKRelay(r, ndk?.relayAuthDefaultPolicy, ndk)
                );
            }
        }
    } catch (e) {
        /* empty */
    }

    return [];
}
