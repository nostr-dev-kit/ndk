import type { Hexpubkey } from "@nostr-dev-kit/ndk";
import { NDKUser as NDKUserClass } from "@nostr-dev-kit/ndk";
import { serializeSession } from "./serialization/session";
import { deserializeSigner } from "./serialization/signer";
import type { SessionStorage } from "./storage/types";
import type { SessionStore } from "./store";
import type { SerializedSession } from "./types";
import { SignerDeserializationError, StorageError } from "./utils/errors";

/**
 * Manages session persistence and restoration.
 * Handles saving, loading, and clearing sessions from storage.
 */
export class PersistenceManager {
    constructor(
        private storage: SessionStorage | undefined,
        private getStore: () => SessionStore,
    ) {}

    /**
     * Restore sessions from storage
     */
    async restore(): Promise<void> {
        if (!this.storage) {
            throw new StorageError("No storage configured");
        }

        const { sessions: serializedSessions, activePubkey } = await this.storage.load();

        // Restore each session
        for (const [pubkey, serialized] of serializedSessions) {
            await this.restoreSession(pubkey, serialized);
        }

        // Restore active session
        if (activePubkey && this.getStore().sessions.has(activePubkey)) {
            this.getStore().switchToUser(activePubkey);
        }
    }

    /**
     * Persist all sessions to storage
     */
    async persist(): Promise<void> {
        if (!this.storage) {
            throw new StorageError("No storage configured");
        }

        const serialized = await this.serializeAllSessions();
        await this.storage.save(serialized, this.getStore().activePubkey);
    }

    /**
     * Clear all sessions from storage
     */
    async clear(): Promise<void> {
        if (!this.storage) {
            throw new StorageError("No storage configured");
        }

        await this.storage.clear();
    }

    /**
     * Restore a single session from serialized data
     * Only restores identity and signer - data will be fetched from relays/cache
     */
    private async restoreSession(pubkey: Hexpubkey, serialized: SerializedSession): Promise<void> {
        const store = this.getStore();

        // Attempt to restore signer
        let signer;
        if (serialized.signerPayload) {
            try {
                signer = await deserializeSigner(serialized.signerPayload, store.ndk);
            } catch (error) {
                // Log error but continue - session can work without signer
                if (error instanceof SignerDeserializationError) {
                    console.warn(`Failed to restore signer for ${pubkey}: ${error.message}`);
                }
            }
        }

        // Create user (with or without signer)
        const user = signer ? await signer.user() : (store.ndk?.getUser({ pubkey }) ?? new NDKUserClass({ pubkey }));

        // Add session without activating
        await store.addSession(signer || user, false);

        // Restore lastActive timestamp
        store.updateSession(pubkey, {
            lastActive: serialized.lastActive,
        });
    }

    /**
     * Serialize all sessions for storage
     */
    private async serializeAllSessions(): Promise<Map<Hexpubkey, SerializedSession>> {
        const store = this.getStore();
        const serialized = new Map<Hexpubkey, SerializedSession>();

        for (const [pubkey, session] of store.sessions) {
            const signer = store.signers.get(pubkey);
            const serializedSession = await serializeSession(session, signer);
            serialized.set(pubkey, serializedSession);
        }

        return serialized;
    }
}
