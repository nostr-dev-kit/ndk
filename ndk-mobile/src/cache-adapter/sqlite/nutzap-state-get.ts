import { NDKNutzap, NdkNutzapStatus } from "@nostr-dev-kit/ndk";
import type { NDKEventId, NDKNutzapState } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "./index.js";

// Define database row type for type checking - specific to this implementation
interface NutzapMonitorRow {
    event_id: string;
    status: string;
    nutzap: string | null;
    redeemed_by_id: string | null;
    error_message: string | null;
    redeemed_amount: string | null;
    updated_at: number;
}

/**
 * Gets all nutzap states from the monitor state table.
 * This function is bound to the NDKCacheAdapterSqlite instance.
 */
export async function getAllNutzapStates(this: NDKCacheAdapterSqlite): Promise<Map<NDKEventId, NDKNutzapState>> {
    const result = new Map<NDKEventId, NDKNutzapState>();

    const nutzaps = (await this.db.getAllAsync("SELECT * FROM nutzap_monitor_state")) as NutzapMonitorRow[];

    for (const row of nutzaps) {
        const state: NDKNutzapState = {
            status: row.status as NdkNutzapStatus,
        };

        // Only deserialize nutzap for states where we might need it
        if (row.nutzap && ![NdkNutzapStatus.REDEEMED, NdkNutzapStatus.SPENT].includes(state.status)) {
            try {
                const rawEvent = JSON.parse(row.nutzap);
                // We need the NDK instance to create the NDKNutzap object
                // Assuming NDK instance is available via `this.ndk` - needs verification/adjustment
                if (this.ndk) {
                    state.nutzap = new NDKNutzap(this.ndk, rawEvent);
                } else {
                    console.warn("NDK instance not available on cache adapter, cannot deserialize Nutzap event");
                }
            } catch (e) {
                console.error("Failed to parse nutzap", e);
            }
        }

        if (row.redeemed_by_id) state.redeemedById = row.redeemed_by_id;
        if (row.error_message) state.errorMessage = row.error_message;
        if (row.redeemed_amount) state.redeemedAmount = Number.parseInt(row.redeemed_amount);

        result.set(row.event_id, state);
    }

    return result;
}
