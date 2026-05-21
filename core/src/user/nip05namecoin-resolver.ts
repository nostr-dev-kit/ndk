/**
 * NDK integration for NIP-05 over Namecoin (`.bit`).
 *
 * Provides {@link getNamecoinNip05For}, a {@link getNip05For}-shaped helper
 * that routes `.bit` / `d/` / `id/` identifiers through a caller-supplied
 * ElectrumX query function instead of DNS. Cache hooks
 * (`cacheAdapter.loadNip05` / `saveNip05`) and the
 * `ndk.queuesNip05` dedup queue are honored exactly like the DNS path.
 *
 * NDK is isomorphic, so this module does **not** bundle a WSS client. The
 * caller injects the transport via {@link NamecoinResolver}.
 */

import type { NDK } from "../ndk/index.js";
import type { ProfilePointer } from "./index.js";
import { NDKUser } from "./index.js";
import { extractNostrFromValue, isValidNamecoinIdentifier, NamecoinAddress } from "./nip05namecoin.js";

/**
 * Caller-supplied transport. Given a parsed Namecoin address, return the raw
 * Namecoin name-value JSON string from the latest `NAME_UPDATE` for the
 * underlying name (`address.namecoinName`).
 *
 * Implementations typically:
 *   1. Open an ElectrumX WSS connection.
 *   2. Call `blockchain.scripthash.get_history` with
 *      `address.electrumScriptHash()`.
 *   3. Fetch the most recent transaction with `blockchain.transaction.get`.
 *   4. Decode the `NAME_UPDATE` output with `parseNameUpdateScript` and
 *      return the `value` bytes as a UTF-8 string.
 *
 * Throwing or rejecting is treated as a resolution failure; callers should
 * race / retry across multiple servers as appropriate.
 */
export type NamecoinResolver = (address: NamecoinAddress) => Promise<string>;

export interface GetNamecoinNip05Opts {
    /** Skip the cache lookup; equivalent to `fetchOpts.cache === "no-cache"`. */
    skipCache?: boolean;
    /**
     * Resolver override. Defaults to `ndk.namecoinResolver` when unset.
     */
    resolver?: NamecoinResolver;
}

/**
 * Resolve a `.bit` / `d/` / `id/` identifier to a {@link ProfilePointer}.
 *
 * Mirrors the shape of {@link getNip05For}: returns `null` when nothing
 * resolves, caches results via `ndk.cacheAdapter`, and dedups concurrent
 * lookups via `ndk.queuesNip05`.
 *
 * If no resolver is configured (neither `opts.resolver` nor
 * `ndk.namecoinResolver`), returns `null` and logs a debug message — it
 * does **not** fall through to DNS-based NIP-05.
 */
export async function getNamecoinNip05For(
    ndk: NDK,
    identifier: string,
    opts: GetNamecoinNip05Opts = {},
): Promise<ProfilePointer | null> {
    if (!isValidNamecoinIdentifier(identifier)) return null;

    return await ndk.queuesNip05.add({
        id: `namecoin:${identifier}`,
        func: async (): Promise<ProfilePointer | null> => {
            const skipCache = opts.skipCache === true;

            // Cache lookup, mirroring getNip05For.
            if (!skipCache && ndk.cacheAdapter?.loadNip05) {
                const cached = await ndk.cacheAdapter.loadNip05(identifier);
                if (cached !== "missing") {
                    if (cached) {
                        return {
                            pubkey: cached.pubkey,
                            relays: cached.relays,
                            nip46: cached.nip46,
                        };
                    }
                    return null;
                }
            }

            const address = NamecoinAddress.parse(identifier);
            if (address === null) {
                if (ndk?.cacheAdapter?.saveNip05) {
                    ndk.cacheAdapter.saveNip05(identifier, null);
                }
                return null;
            }

            const resolver = opts.resolver ?? ndk.namecoinResolver;
            if (!resolver) {
                ndk?.debug?.("no namecoin resolver configured; returning null for %s", identifier);
                return null;
            }

            let rawJson: string;
            try {
                rawJson = await resolver(address);
            } catch (err) {
                if (ndk?.cacheAdapter?.saveNip05) {
                    ndk.cacheAdapter.saveNip05(identifier, null);
                }
                console.error("Failed to resolve Namecoin NIP-05 for", identifier, err);
                return null;
            }

            let value: unknown;
            try {
                value = JSON.parse(rawJson);
            } catch (err) {
                if (ndk?.cacheAdapter?.saveNip05) {
                    ndk.cacheAdapter.saveNip05(identifier, null);
                }
                console.error("Failed to parse Namecoin name value JSON for", identifier, err);
                return null;
            }

            const extracted = extractNostrFromValue(address, value);
            let profile: ProfilePointer | null = null;
            if (extracted !== null) {
                profile = { pubkey: extracted.pubkey };
                if (extracted.relays) profile.relays = extracted.relays;
                if (extracted.nip46) profile.nip46 = extracted.nip46;
            }

            if (ndk?.cacheAdapter?.saveNip05) {
                ndk.cacheAdapter.saveNip05(identifier, profile);
            }
            return profile;
        },
    });
}

/**
 * Convenience helper: same as {@link getNamecoinNip05For} but returns an
 * {@link NDKUser} instead of a {@link ProfilePointer}. Used by
 * `NDKUser.fromNip05` when a Namecoin resolver is configured.
 */
export async function getNamecoinNip05User(
    ndk: NDK,
    identifier: string,
    opts: GetNamecoinNip05Opts = {},
): Promise<NDKUser | undefined> {
    const profile = await getNamecoinNip05For(ndk, identifier, opts);
    if (!profile) return undefined;
    const user = new NDKUser({
        pubkey: profile.pubkey,
        relayUrls: profile.relays,
        nip46Urls: profile.nip46,
    });
    user.ndk = ndk;
    return user;
}
