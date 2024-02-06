import { Hexpubkey } from ".";

export const NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/;

export async function getNip05For(
    fullname: string,
    _fetch: typeof fetch = fetch,
    fetchOpts: RequestInit = {}
) {
    const match = fullname.match(NIP05_REGEX);
    if (!match) return null;

    const [_, name = "_", domain] = match;

    try {
        const res = await _fetch(
            `https://${domain}/.well-known/nostr.json?name=${name}`,
            fetchOpts
        );
        const { names, relays, nip46 } = parseNIP05Result(await res.json());

        const pubkey = names[name];
        return pubkey
            ? {
                  pubkey,
                  relays: relays?.[pubkey],
                  nip46: nip46?.[pubkey],
              }
            : null;
    } catch (_e) {
        return null;
    }
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
            result.names[name] = pubkey;
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
        for (const [pubkey, nip46] of Object.entries(json.relays)) {
            if (typeof pubkey === "string" && Array.isArray(nip46)) {
                result.nip46[pubkey] = nip46.filter((relay: unknown) => typeof relay === "string");
            }
        }
    }

    return result;
}
