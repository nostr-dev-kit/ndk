import type { NDKEventId, NDKNutzapState } from "@nostr-dev-kit/ndk";
import type { NDKCacheAdapterSqlite } from "./index.js";

type QueryDetails = {
    query: string;
    params: any[];
};

/**
 * Prepares the query and parameters to update the state of a nutzap in the monitor state table.
 * This function is bound to the NDKCacheAdapterSqlite instance.
 * @returns QueryDetails object containing the SQL query and parameters, or null if no update is needed or adapter not ready.
 */
export async function prepareNutzapStateUpdate(
    this: NDKCacheAdapterSqlite,
    id: NDKEventId,
    stateChange: Partial<NDKNutzapState>
): Promise<QueryDetails | null> {
    // Readiness checks removed as initialization is now synchronous.


    const now = Math.floor(Date.now() / 1000);

    // Serialize the nutzap if it exists
    let nutzapJson: string | null = null;
    if (stateChange.nutzap) {
        // Assuming nutzap object has a rawEvent() method or similar for serialization
        nutzapJson = JSON.stringify(stateChange.nutzap.rawEvent());
    }

    // Check if state already exists
    const existingState = (await this.db.getFirstAsync(
        "SELECT event_id FROM nutzap_monitor_state WHERE event_id = ?",
        [id]
    )) as { event_id: string } | undefined;

    if (existingState) {
        // Prepare update query
        return {
            query: `UPDATE nutzap_monitor_state SET
                status = COALESCE(?, status),
                nutzap = COALESCE(?, nutzap),
                redeemed_by_id = COALESCE(?, redeemed_by_id),
                error_message = COALESCE(?, error_message),
                redeemed_amount = COALESCE(?, redeemed_amount),
                updated_at = ?
                WHERE event_id = ?`,
            params: [
                stateChange.status,
                nutzapJson,
                stateChange.redeemedById,
                stateChange.errorMessage,
                stateChange.redeemedAmount,
                now,
                id,
            ]
        };
    } else {
        // Prepare insert query
        return {
            query: `INSERT INTO nutzap_monitor_state (
                event_id,
                status,
                nutzap,
                redeemed_by_id,
                error_message,
                redeemed_amount,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            params: [
                id,
                stateChange.status,
                nutzapJson,
                stateChange.redeemedById,
                stateChange.errorMessage,
                stateChange.redeemedAmount,
                now,
            ]
        };
    }
}