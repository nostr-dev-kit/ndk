/**
 * Relay capability checking utilities.
 * Uses NIP-11 (Relay Information Document) to check for NIP-77 support.
 */

import type { NDKRelay, NDKRelayInformation } from "@nostr-dev-kit/ndk";
import { fetchRelayInformation } from "@nostr-dev-kit/ndk";

/**
 * Check if a relay supports NIP-77 (Negentropy).
 *
 * @param relay - The relay to check
 * @returns Promise<boolean> - True if relay supports NIP-77
 *
 * @example
 * ```typescript
 * const relay = ndk.pool.relays.get("wss://relay.example.com");
 * const supportsSync = await supportsNegentropy(relay);
 *
 * if (supportsSync) {
 *   const result = await ndkSync.call(ndk, filters);
 * } else {
 *   console.log("Relay doesn't support NIP-77 sync");
 * }
 * ```
 */
export async function supportsNegentropy(relay: NDKRelay | string): Promise<boolean> {
    try {
        const info = typeof relay === "string"
            ? await fetchRelayInformation(relay)
            : await relay.fetchInfo();
        return info.supported_nips?.includes(77) ?? false;
    } catch (_error) {
        // If we can't fetch relay info, assume no support
        return false;
    }
}

/**
 * Filter relays to only those supporting NIP-77.
 *
 * @param relays - Array of relays or relay URLs to check
 * @returns Promise<string[]> - Array of relay URLs that support NIP-77
 *
 * @example
 * ```typescript
 * const allRelays = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band"];
 * const syncRelays = await filterNegentropyRelays(allRelays);
 *
 * if (syncRelays.length > 0) {
 *   const result = await ndkSync.call(ndk, filters, { relayUrls: syncRelays });
 * } else {
 *   console.log("No relays support NIP-77");
 * }
 * ```
 */
export async function filterNegentropyRelays(relays: (NDKRelay | string)[]): Promise<string[]> {
    const results = await Promise.all(
        relays.map(async (relay) => {
            const relayUrl = typeof relay === "string" ? relay : relay.url;
            const supports = await supportsNegentropy(relay);
            return supports ? relayUrl : null;
        }),
    );

    return results.filter((url): url is string => url !== null);
}

/**
 * Get detailed capability information for a relay.
 *
 * @param relay - The relay to check
 * @returns Promise<RelayCapabilities> - Detailed capability information
 *
 * @example
 * ```typescript
 * const caps = await getRelayCapabilities("wss://relay.damus.io");
 * console.log(`Negentropy: ${caps.supportsNegentropy}`);
 * console.log(`Software: ${caps.software} ${caps.version}`);
 * ```
 */
export async function getRelayCapabilities(relay: NDKRelay | string): Promise<RelayCapabilities> {
    const relayUrl = typeof relay === "string" ? relay : relay.url;

    try {
        const info = typeof relay === "string"
            ? await fetchRelayInformation(relay)
            : await relay.fetchInfo();

        return {
            url: relayUrl,
            name: info.name,
            software: info.software,
            version: info.version,
            supportedNips: info.supported_nips ?? [],
            supportsNegentropy: info.supported_nips?.includes(77) ?? false,
            limitations: info.limitation,
        };
    } catch (error) {
        return {
            url: relayUrl,
            supportedNips: [],
            supportsNegentropy: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Relay capability information.
 */
export interface RelayCapabilities {
    url: string;
    name?: string;
    software?: string;
    version?: string;
    supportedNips: number[];
    supportsNegentropy: boolean;
    limitations?: NDKRelayInformation["limitation"];
    error?: string;
}
