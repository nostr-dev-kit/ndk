import type { Hexpubkey, NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";

export type MintUrl = string;
export type MintUsage = {
    /**
     * All the events that are associated with this mint.
     */
    events: NDKEvent[];

    pubkeys: Set<Hexpubkey>;
};
export type NDKCashuMintRecommendation = Record<MintUrl, MintUsage>;

/**
 * Provides a list of mint recommendations.
 * @param ndk
 * @param filter optional extra filter to apply to the REQ
 */
export async function getCashuMintRecommendations(
    ndk: NDK,
    filter?: NDKFilter
): Promise<NDKCashuMintRecommendation> {
    const f: NDKFilter[] = [
        { kinds: [NDKKind.EcashMintRecommendation], "#k": ["38002"], ...(filter || {}) },
        { kinds: [NDKKind.CashuMintList], ...(filter || {}) },
    ];
    const res: NDKCashuMintRecommendation = {};

    const recommendations = await ndk.fetchEvents(f);

    for (const event of recommendations) {
        switch (event.kind) {
            case NDKKind.EcashMintRecommendation:
                for (const uTag of event.getMatchingTags("u")) {
                    if (uTag[2] && uTag[2] !== "cashu") continue;

                    const url = uTag[1];
                    if (!url) continue;

                    const entry = res[url] || { events: [], pubkeys: new Set() };
                    entry.events.push(event);
                    entry.pubkeys.add(event.pubkey);
                    res[url] = entry;
                }
                break;

            case NDKKind.CashuMintList:
                for (const mintTag of event.getMatchingTags("mint")) {
                    const url = mintTag[1];
                    if (!url) continue;

                    const entry = res[url] || { events: [], pubkeys: new Set() };
                    entry.events.push(event);
                    entry.pubkeys.add(event.pubkey);
                    res[url] = entry;
                }
                break;
        }
    }

    return res;
}
