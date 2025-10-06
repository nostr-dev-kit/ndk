import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { SerializedSession } from "../types";
import { StorageError } from "../utils/errors";
import { deserializeSessionData, type SessionData, serializeSessionData } from "../utils/json-serializer";
import type { SessionStorage } from "./types";

/**
 * File system storage implementation for Node.js
 */
export class FileStorage implements SessionStorage {
    constructor(private filePath: string = "./.ndk-sessions.json") {}

    async save(sessions: Map<Hexpubkey, SerializedSession>, activePubkey?: Hexpubkey): Promise<void> {
        try {
            const data: SessionData = { sessions, activePubkey };
            const serialized = serializeSessionData(data);

            // Dynamic import for Node.js modules
            const { writeFile } = await import("fs/promises");
            await writeFile(this.filePath, serialized);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new StorageError(`Failed to save sessions to file: ${message}`);
        }
    }

    async load(): Promise<SessionData> {
        try {
            const { readFile } = await import("fs/promises");
            const raw = await readFile(this.filePath, "utf-8");
            return deserializeSessionData(raw);
        } catch (error: any) {
            // File doesn't exist - return empty data
            if (error?.code === "ENOENT") {
                return { sessions: new Map() };
            }
            // Other errors - throw for proper handling
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new StorageError(`Failed to load sessions from file: ${message}`);
        }
    }

    async clear(): Promise<void> {
        try {
            const { unlink } = await import("fs/promises");
            await unlink(this.filePath);
        } catch (error: any) {
            // File doesn't exist - ignore
            if (error?.code !== "ENOENT") {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new StorageError(`Failed to clear sessions file: ${message}`);
            }
        }
    }
}
