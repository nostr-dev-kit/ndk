import type { Hexpubkey, ProfilePointer } from ".";
import { NDKUser } from ".";
import type { NDK } from "../ndk";

export const NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/;

export async function getNip05For(
    ndk: NDK,
    fullname: string,
    _fetch: typeof fetch = fetch,
    fetchOpts: RequestInit = {}
) {
    return await ndk.queuesNip05.add({
        id: fullname,
        func: async (): Promise<ProfilePointer | null> => {
            // If we have a cache, try to load from cache first
            if (ndk.cacheAdapter && ndk.cacheAdapter.loadNip05) {
                const profile = await ndk.cacheAdapter.loadNip05(fullname);

                if (profile !== "missing") {
                    if (profile) {
                        const user = new NDKUser({
                            pubkey: profile.pubkey,
                            relayUrls: profile.relays,
                            nip46Urls: profile.nip46,
                        });
                        user.ndk = ndk;
                        return user;
                    } else if (fetchOpts.cache !== "no-cache") {
                        return null;
                    }
                }
            }

            const match = fullname.match(NIP05_REGEX);
            if (!match) return null;

            const [_, name = "_", domain] = match;

            try {
                const res = await _fetch(
                    `https://${domain}/.well-known/nostr.json?name=${name}`,
                    fetchOpts
                );
                const { names, relays, nip46 } = parseNIP05Result(await res.json());

                const pubkey = names[name.toLowerCase()];
                let profile: ProfilePointer | null = null;
                if (pubkey) {
                    profile = { pubkey, relays: relays?.[pubkey], nip46: nip46?.[pubkey] };
                }

                // Save the lookup to cache
                if (ndk?.cacheAdapter && ndk.cacheAdapter.saveNip05) {
                    ndk.cacheAdapter.saveNip05(fullname, profile);
                }

                return profile;
            } catch (_e) {
                // Save the failed lookup to cache
                if (ndk?.cacheAdapter && ndk.cacheAdapter.saveNip05) {
                    ndk?.cacheAdapter.saveNip05(fullname, null);
                }
                console.error("Failed to fetch NIP05 for", fullname, _e);
                return null;
            }
        },
    });
}

export interface NIP05Result {
    names: {
        [name: string]: string;
    };
    relays?: { [pubkey: Hexpubkey]: string[] };
    nip46?: { [pubkey: Hexpubkey]: string[] };
}

function parseNIP05Result(json: any): NIP05Result {
    const result: NIP05Result = {
        names: {},
    };

    for (const [name, pubkey] of Object.entries(json.names)) {
        if (typeof name === "string" && typeof pubkey === "string") {
            result.names[name.toLowerCase()] = pubkey;
        }
    }

    if (json.relays) {
        result.relays = {};
        for (const [pubkey, relays] of Object.entries(json.relays)) {
            if (typeof pubkey === "string" && Array.isArray(relays)) {
                result.relays[pubkey] = relays.filter(
                    (relay: unknown) => typeof relay === "string"
                );
            }
        }
    }

    if (json.nip46) {
        result.nip46 = {};
        for (const [pubkey, nip46] of Object.entries(json.nip46)) {
            if (typeof pubkey === "string" && Array.isArray(nip46)) {
                result.nip46[pubkey] = nip46.filter((relay: unknown) => typeof relay === "string");
            }
        }
    }

    return result;
}
