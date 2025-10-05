import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import type { SerializedSession } from "../types";
import type { SessionStorage } from "./types";
import { serializeSessionData, deserializeSessionData, type SessionData } from "../utils/json-serializer";
import { StorageError } from "../utils/errors";

/**
 * Browser localStorage implementation
 */
export class LocalStorage implements SessionStorage {
    constructor(private key: string = 'ndk-sessions') {}

    async save(sessions: Map<Hexpubkey, SerializedSession>, activePubkey?: Hexpubkey): Promise<void> {
        if (typeof window === 'undefined' || !window.localStorage) {
            throw new StorageError('localStorage is not available');
        }

        try {
            const data: SessionData = { sessions, activePubkey };
            const serialized = serializeSessionData(data);
            localStorage.setItem(this.key, serialized);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new StorageError(`Failed to save sessions to localStorage: ${message}`);
        }
    }

    async load(): Promise<SessionData> {
        if (typeof window === 'undefined' || !window.localStorage) {
            return { sessions: new Map() };
        }

        const raw = localStorage.getItem(this.key);
        if (!raw) {
            return { sessions: new Map() };
        }

        try {
            return deserializeSessionData(raw);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new StorageError(`Failed to parse sessions from localStorage: ${message}`);
        }
    }

    async clear(): Promise<void> {
        if (typeof window === 'undefined' || !window.localStorage) {
            throw new StorageError('localStorage is not available');
        }
        
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new StorageError(`Failed to clear sessions from localStorage: ${message}`);
        }
    }
}
