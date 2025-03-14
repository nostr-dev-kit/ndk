import NDK, { NDKEvent, NDKEventId, NDKNutzap } from "@nostr-dev-kit/ndk";
import * as SQLite from "expo-sqlite";
import { NDKCacheAdapterSqlite } from "../../cache-adapter/sqlite.js";
import { NdkNutzapStatus, NDKNutzapState } from "@nostr-dev-kit/ndk-wallet";

function withDb(ndk: NDK) {
    const db = (ndk.cacheAdapter as NDKCacheAdapterSqlite).db;
    if (!(db instanceof SQLite.SQLiteDatabase)) {
        throw new Error("Database is not an instance of SQLiteDatabase");
    }
    return db;
}

// Define database row type for type checking
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
 * Gets all nutzaps from the monitor state table
 */
export async function getAllNutzaps(ndk: NDK): Promise<Map<NDKEventId, NDKNutzapState>> {
    const db = withDb(ndk);
    const result = new Map<NDKEventId, NDKNutzapState>();

    const nutzaps = (await db.getAllAsync(
        "SELECT * FROM nutzap_monitor_state"
    )) as NutzapMonitorRow[];

    for (const row of nutzaps) {
        const state: NDKNutzapState = {
            status: row.status as NdkNutzapStatus,
        };

        // Only deserialize nutzap for states where we might need it
        if (
            row.nutzap &&
            ![NdkNutzapStatus.REDEEMED, NdkNutzapStatus.SPENT].includes(state.status)
        ) {
            try {
                const rawEvent = JSON.parse(row.nutzap);
                state.nutzap = new NDKNutzap(ndk, rawEvent);
            } catch (e) {
                console.error("Failed to parse nutzap", e);
            }
        }

        if (row.redeemed_by_id) state.redeemedById = row.redeemed_by_id;
        if (row.error_message) state.errorMessage = row.error_message;
        if (row.redeemed_amount) state.redeemedAmount = parseInt(row.redeemed_amount);

        result.set(row.event_id, state);
    }

    return result;
}

/**
 * Updates the state of a nutzap in the monitor state table
 */
export async function setNutzapState(
    ndk: NDK,
    id: NDKEventId,
    stateChange: Partial<NDKNutzapState>
): Promise<void> {
    const db = withDb(ndk);
    const now = Math.floor(Date.now() / 1000);

    // Serialize the nutzap if it exists
    let nutzapJson: string | null = null;
    if (stateChange.nutzap) {
        nutzapJson = JSON.stringify(stateChange.nutzap.rawEvent());
    }

    // Check if state already exists
    const existingState = (await db.getFirstAsync(
        "SELECT event_id FROM nutzap_monitor_state WHERE event_id = ?",
        [id]
    )) as { event_id: string } | undefined;

    if (existingState) {
        // Update existing state
        await db.runAsync(
            `UPDATE nutzap_monitor_state SET 
            status = COALESCE(?, status),
            nutzap = COALESCE(?, nutzap),
            redeemed_by_id = COALESCE(?, redeemed_by_id),
            error_message = COALESCE(?, error_message),
            redeemed_amount = COALESCE(?, redeemed_amount),
            updated_at = ?
            WHERE event_id = ?`,
            [
                stateChange.status,
                nutzapJson,
                stateChange.redeemedById,
                stateChange.errorMessage,
                stateChange.redeemedAmount,
                now,
                id,
            ]
        );
    } else {
        // Insert new state
        await db.runAsync(
            `INSERT INTO nutzap_monitor_state (
                event_id, 
                status, 
                nutzap, 
                redeemed_by_id, 
                error_message, 
                redeemed_amount, 
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                stateChange.status,
                nutzapJson,
                stateChange.redeemedById,
                stateChange.errorMessage,
                stateChange.redeemedAmount,
                now,
            ]
        );
    }
}

/**
 * Creates a store object for the NDKNutzapMonitor
 */
export function createNutzapMonitorStore(ndk: NDK) {
    return {
        getAllNutzaps: () => getAllNutzaps(ndk),
        setNutzapState: (id: NDKEventId, stateChange: Partial<NDKNutzapState>) =>
            setNutzapState(ndk, id, stateChange),
    };
}
