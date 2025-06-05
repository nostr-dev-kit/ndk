import { SCHEMA } from "./schema";
import type { SQLiteDatabase } from "../types";

/**
 * Runs all necessary database migrations.
 * Applies the schema for events, profiles, nutzap_monitor_state, decrypted_events, and unpublished_events tables.
 * @param db The better-sqlite3 database instance
 */
export function runMigrations(db: SQLiteDatabase): void {
    db.exec(SCHEMA.events);
    db.exec(SCHEMA.profiles);
    db.exec(SCHEMA.nutzap_monitor_state);
    db.exec(SCHEMA.decrypted_events);
    db.exec(SCHEMA.unpublished_events);
    db.exec(SCHEMA.event_tags);
}
