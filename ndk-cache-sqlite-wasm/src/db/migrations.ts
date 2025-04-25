import { SCHEMA } from "./schema";

/**
 * Runs all necessary database migrations.
 * Applies the schema for events, profiles, and nutzap_monitor_state tables.
 * @param db The SQLite WASM database instance
 */
export async function runMigrations(db: any): Promise<void> {
    // This assumes db exposes an exec or run method for SQL statements (e.g., sql.js Database)
    // Replace with the actual API of your WASM SQLite library
    db.exec?.(SCHEMA.events);
    db.exec?.(SCHEMA.profiles);
    db.exec?.(SCHEMA.nutzap_monitor_state);
    // Add more migrations as needed
}