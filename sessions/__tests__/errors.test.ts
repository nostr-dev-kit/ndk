import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDKSessionManager } from "../src/manager";
import { MemoryStorage } from "../src/storage";
import { createSessionStore } from "../src/store";
import {
    NDKNotInitializedError,
    NoActiveSessionError,
    SessionNotFoundError,
    SignerDeserializationError,
    StorageError,
} from "../src/utils/errors";

describe("Error Handling", () => {
    let ndk: NDK;
    let manager: NDKSessionManager;

    beforeEach(() => {
        ndk = new NDK({ explicitRelayUrls: ["wss://relay.example.com"] });
        manager = new NDKSessionManager(ndk);
    });

    describe("Session Errors", () => {
        it("should throw NoActiveSessionError when logging out without active session", () => {
            expect(() => manager.logout()).toThrow(NoActiveSessionError);
            expect(() => manager.logout()).toThrow("No active session");
        });

        it("should throw SessionNotFoundError when switching to non-existent session", () => {
            const fakeKey = "nonexistentpubkey";
            expect(() => manager.switchTo(fakeKey)).toThrow(SessionNotFoundError);
            expect(() => manager.switchTo(fakeKey)).toThrow(`Session not found for pubkey: ${fakeKey}`);
        });

        it("should throw SessionNotFoundError when starting session for non-existent pubkey", () => {
            const fakeKey = "nonexistentpubkey";
            expect(() => manager.startSession(fakeKey, { profile: true })).toThrow(SessionNotFoundError);
        });
    });

    describe("Storage Errors", () => {
        it("should throw StorageError when restoring without storage configured", async () => {
            await expect(manager.restore()).rejects.toThrow(StorageError);
            await expect(manager.restore()).rejects.toThrow("No storage configured");
        });

        it("should throw StorageError when persisting without storage configured", async () => {
            await expect(manager.persist()).rejects.toThrow(StorageError);
            await expect(manager.persist()).rejects.toThrow("No storage configured");
        });

        it("should throw StorageError when clearing without storage configured", async () => {
            await expect(manager.clear()).rejects.toThrow(StorageError);
            await expect(manager.clear()).rejects.toThrow("No storage configured");
        });

        it("should handle storage load failures gracefully", async () => {
            const mockStorage = new MemoryStorage();
            vi.spyOn(mockStorage, "load").mockRejectedValue(new Error("Read error"));

            const storageManager = new NDKSessionManager(ndk, {
                storage: mockStorage,
            });

            await expect(storageManager.restore()).rejects.toThrow(Error);
        });

        it("should handle storage save failures gracefully", async () => {
            const mockStorage = new MemoryStorage();
            vi.spyOn(mockStorage, "save").mockRejectedValue(new Error("Write error"));

            const storageManager = new NDKSessionManager(ndk, {
                storage: mockStorage,
            });

            // Add a session first
            const signer = NDKPrivateKeySigner.generate();
            await storageManager.login(signer);

            await expect(storageManager.persist()).rejects.toThrow(Error);
        });
    });

    describe("Signer Deserialization Errors", () => {
        it("should continue loading sessions even if signer deserialization fails", async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, { storage });

            // Create and save a session with an invalid signer payload
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();
            await manager1.login(signer);
            await manager1.persist(); // Explicitly persist before corrupting

            // Corrupt the saved data to simulate deserialization failure
            const saved = await storage.load();
            const sessions = saved.sessions;
            sessions.forEach((session) => {
                session.signerPayload = "invalid-signer-payload";
            });
            await storage.save(sessions, saved.activePubkey);

            // Create new manager and restore
            const manager2 = new NDKSessionManager(ndk, { storage });

            // Should not throw, but log warning
            const consoleWarnSpy = vi.spyOn(console, "warn");
            await manager2.restore();

            // Session should be restored without signer
            expect(manager2.getSessions().size).toBe(1);
            expect(consoleWarnSpy).toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });
    });

    describe("NDK Initialization Errors", () => {
        it("should throw NDKNotInitializedError when starting session without NDK", () => {
            const store = createSessionStore();

            // Try to start session without initializing NDK
            expect(() => {
                store.getState().startSession("fakepubkey", { profile: true });
            }).toThrow(NDKNotInitializedError);
            expect(() => {
                store.getState().startSession("fakepubkey", { profile: true });
            }).toThrow("NDK not initialized. Call init() first.");
        });
    });

    describe("Auto-save Error Handling", () => {
        it("should log error when auto-save fails", async () => {
            const mockStorage = new MemoryStorage();
            const consoleErrorSpy = vi.spyOn(console, "error");

            const storageManager = new NDKSessionManager(ndk, {
                storage: mockStorage,
                autoSave: true,
                saveDebounceMs: 10,
            });

            // Mock save to throw error
            vi.spyOn(mockStorage, "save").mockRejectedValue(new Error("Save failed"));

            // Trigger auto-save
            const signer = NDKPrivateKeySigner.generate();
            await storageManager.login(signer);

            // Wait for debounced save
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to auto-save sessions:", expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });
});
