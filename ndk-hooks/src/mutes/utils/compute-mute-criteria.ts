import type { MuteCriteria, NDKUserMutes } from "../store/types";

/**
 * Combines two mute sources (user mutes and extra mutes) into a single MuteCriteria.
 * If userMutes is undefined, only extraMutes are used.
 */
export function computeMuteCriteria(userMutes: NDKUserMutes | undefined, extraMutes: NDKUserMutes): MuteCriteria {
    return {
        pubkeys: new Set<string>([
            ...((userMutes?.pubkeys as Set<string>) ?? []),
            ...((extraMutes.pubkeys as Set<string>) ?? []),
        ]),
        eventIds: new Set<string>([
            ...((userMutes?.eventIds as Set<string>) ?? []),
            ...((extraMutes.eventIds as Set<string>) ?? []),
        ]),
        hashtags: new Set<string>([
            ...((userMutes?.hashtags as Set<string>) ?? []),
            ...((extraMutes.hashtags as Set<string>) ?? []),
        ]),
        words: new Set<string>([
            ...((userMutes?.words as Set<string>) ?? []),
            ...((extraMutes.words as Set<string>) ?? []),
        ]),
    };
}
