import { NDKEventId, NDKNutzap } from "@nostr-dev-kit/ndk";
import { proofP2pkNostr } from "@nostr-dev-kit/ndk";

type GroupedNutzaps = {
    mint: string;
    p2pk: string;
    nutzaps: NDKNutzap[];
}

export function groupNutzaps(nutzaps: NDKNutzap[], knownNutzaps: Set<NDKEventId>): Array<GroupedNutzaps> {
    const result = new Map<string, GroupedNutzaps>();
    const getKey = (mint: string, p2pk: string = "no-key") => `${mint}:${p2pk}`;
    
    for (const nutzap of nutzaps) {
        if (knownNutzaps.has(nutzap.id)) continue;

        const mint = nutzap.mint;

        for (const proof of nutzap.proofs) {
            const p2pk = proofP2pkNostr(proof);
            const safeP2pk = p2pk || "no-key";

            // add to the right group
            const key = getKey(mint, safeP2pk);
            const group = (result.get(key) ?? { mint, p2pk: safeP2pk, nutzaps: [] }) as GroupedNutzaps;
            group.nutzaps.push(nutzap);
            result.set(key, group);
        }
    }
    
    return Array.from(result.values());
}