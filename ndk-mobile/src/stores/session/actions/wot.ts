import NDK, { Hexpubkey, NDKEvent, NDKKind, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { NDKCacheAdapterSqlite } from "../../../cache-adapter/sqlite.js";
import { SettingsStore } from "../../../types.js";
import { SessionState } from "../types.js";

export const wotEntries = new Map<Hexpubkey, { time: number; list: Set<Hexpubkey> }>();

// update the wot if:
// - we don't have an SQLite cache adapter
// - there is no wot
// - the wot was not computed in the past 72 hours
// - the wot has less than 1000 entries
export function shouldUpdateWot(ndk: NDK, settingsStore: SettingsStore): boolean {
    console.log("shouldUpdateWot?");
    const cacheAdapter = ndk.cacheAdapter;
    if (!(cacheAdapter instanceof NDKCacheAdapterSqlite)) {
        console.log("no sqlite cache adapter");
        return true;
    }

    const _wotLastUpdatedAt = settingsStore.getSync("wot.last_updated_at");
    if (!_wotLastUpdatedAt) return true;
    const wotLastUpdatedAt = parseInt(_wotLastUpdatedAt);

    console.log("wotLastUpdatedAt", wotLastUpdatedAt);

    const _followCount = settingsStore.getSync("wot.length");
    if (!_followCount) return true;
    const followCount = parseInt(_followCount);

    console.log("followCount", followCount);

    if (Date.now() - wotLastUpdatedAt > 72 * 60 * 60 * 1000) return true;
    if (followCount < 1000) return true;

    return false;
}

export function updateWotState(settingsStore: SettingsStore, wot: Map<Hexpubkey, number>) {
    settingsStore.set("wot.last_updated_at", Date.now().toString());
    settingsStore.set("wot.length", wot.size.toString());
}

/**
 * Computes the WoT from a user's follows.
 */
export function addWotEntries(
    ndk: NDK,
    follows: Hexpubkey[],
    settingsStore: SettingsStore,
    set: (state: Partial<SessionState>) => void,
    cb: () => void
) {
    let eosed = false;

    const addEntry = (event: NDKEvent) => {
        const currentEntryTime = wotEntries.get(event.pubkey)?.time;
        if (currentEntryTime && currentEntryTime >= event.created_at) return;

        if (wotEntries.size % 10 === 0) {
            console.log("wotEntries size", wotEntries.size);
        }

        wotEntries.set(event.pubkey, {
            time: event.created_at,
            list: new Set(
                event.tags.filter((tag) => tag[0] === "p" && !!tag[1]).map((tag) => tag[1])
            ),
        });
    };

    const updateComputedWot = () => {
        const computedWot = new Map<Hexpubkey, number>();
        for (const entry of wotEntries.values()) {
            for (const pubkey of entry.list) {
                computedWot.set(pubkey, (computedWot.get(pubkey) || 0) + 1);
            }
        }

        console.log("updating computed wot", computedWot.size);

        set({ wot: computedWot });
        cb();
        persistWot(ndk, computedWot, settingsStore);
    };

    const relaySet = NDKRelaySet.fromRelayUrls(
        ["wss://purplepag.es", "wss://relay.nostr.band"],
        ndk
    );
    const sub = ndk.subscribe(
        {
            kinds: [NDKKind.Contacts],
            authors: follows,
        },
        { skipVerification: true, subId: "wot", groupable: false, closeOnEose: true },
        relaySet,
        false
    );
    console.log("requesting follows for wot", follows.length);
    sub.on("event", (event: NDKEvent) => {
        addEntry(event);

        if (eosed) updateComputedWot();
    });
    sub.on("eose", () => {
        console.log("EOSE wot", wotEntries.size);
        eosed = true;
        updateComputedWot();
    });
    sub.start();
}

export function persistWot(ndk: NDK, wot: Map<Hexpubkey, number>, settingsStore: SettingsStore) {
    const cacheAdapter = ndk.cacheAdapter;
    if (cacheAdapter instanceof NDKCacheAdapterSqlite) {
        console.log("persisting wot to database", wot.size);

        updateWotState(settingsStore, wot);
        cacheAdapter.saveWot(wot);
    }
}
