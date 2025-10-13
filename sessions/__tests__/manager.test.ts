import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDKSessionManager } from "../src/manager";
import { MemoryStorage } from "../src/storage";

describe("NDKSessionManager", () => {
    let ndk: NDK;
    let manager: NDKSessionManager;

    beforeEach(() => {
        ndk = new NDK({ explicitRelayUrls: ["wss://relay.example.com"] });
        manager = new NDKSessionManager(ndk);
    });

    describe("login", () => {
        it("should login with a signer", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            const pubkey = await manager.login(signer);

            expect(pubkey).toBe(user.pubkey);
            expect(manager.getSessions().size).toBe(1);
            expect(manager.activePubkey).toBe(user.pubkey);
        });

        it("should login with a user (read-only)", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            const pubkey = await manager.login(user);

            expect(pubkey).toBe(user.pubkey);
            expect(manager.getSessions().size).toBe(1);
            expect(manager.activePubkey).toBe(user.pubkey);
        });

        it("should support multiple sessions", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();

            await manager.login(signer1);
            await manager.login(signer2);

            expect(manager.getSessions().size).toBe(2);
        });

        it("should set active session when setActive is true", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1, { setActive: true });
            expect(manager.activePubkey).toBe(user1.pubkey);

            await manager.login(signer2, { setActive: true });
            expect(manager.activePubkey).toBe(user2.pubkey);
        });

        it("should not change active session when setActive is false", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1, { setActive: true });
            await manager.login(signer2, { setActive: false });

            expect(manager.activePubkey).toBe(user1.pubkey);
        });
    });

    describe("logout", () => {
        it("should logout active session", async () => {
            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            expect(manager.getSessions().size).toBe(1);

            manager.logout();

            expect(manager.getSessions().size).toBe(0);
            expect(manager.activePubkey).toBeUndefined();
        });

        it("should logout specific session", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();

            await manager.login(signer1);
            await manager.login(signer2);

            manager.logout(user1.pubkey);

            expect(manager.getSessions().size).toBe(1);
            expect(manager.getSession(user1.pubkey)).toBeUndefined();
        });

        it("should switch to another session when logging out active session", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            expect(manager.activePubkey).toBe(user2.pubkey);

            manager.logout(user2.pubkey);

            expect(manager.activePubkey).toBe(user1.pubkey);
        });

        it("should actually remove sessions when logging out multiple times", async () => {
            // Regression test for bug where sessions were only switched, not removed
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            expect(manager.getSessions().size).toBe(2);
            expect(manager.activePubkey).toBe(user2.pubkey);

            // Logout first active session
            manager.logout();

            // Verify session was actually removed, not just switched
            expect(manager.getSessions().size).toBe(1);
            expect(manager.getSession(user2.pubkey)).toBeUndefined();
            expect(manager.activePubkey).toBe(user1.pubkey);

            // Logout second session
            manager.logout();

            // Verify both sessions are removed
            expect(manager.getSessions().size).toBe(0);
            expect(manager.getSession(user1.pubkey)).toBeUndefined();
            expect(manager.activePubkey).toBeUndefined();
        });
    });

    describe("switchTo", () => {
        it("should switch between sessions", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            manager.switchTo(user1.pubkey);
            expect(manager.activePubkey).toBe(user1.pubkey);

            manager.switchTo(user2.pubkey);
            expect(manager.activePubkey).toBe(user2.pubkey);
        });

        it("should clear active session when switching to null", async () => {
            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            manager.switchTo(null);

            expect(manager.activePubkey).toBeUndefined();
        });
    });

    describe("persistence", () => {
        it("should persist and restore sessions", async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, { storage });

            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager1.login(signer);
            await manager1.persist();

            // Create new manager with same storage
            const manager2 = new NDKSessionManager(ndk, { storage });
            await manager2.restore();

            expect(manager2.getSessions().size).toBe(1);
            expect(manager2.activePubkey).toBe(user.pubkey);
        });

        it("should auto-save when enabled", async () => {
            const storage = new MemoryStorage();
            const saveSpy = vi.spyOn(storage, "save");

            const manager = new NDKSessionManager(ndk, {
                storage,
                autoSave: true,
                saveDebounceMs: 10,
            });

            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            // Wait for debounced save
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe("activeUser", () => {
        it("should return active user", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            const activeUser = manager.activeUser;
            expect(activeUser).toBeDefined();
            expect(activeUser?.pubkey).toBe(user.pubkey);
        });
    });

    describe("subscribe", () => {
        it("should notify subscribers of state changes", async () => {
            const callback = vi.fn();
            manager.subscribe(callback);

            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            expect(callback).toHaveBeenCalled();
        });
    });

    describe("ndk.signer management", () => {
        it("should set ndk.signer when logging in with a signer", async () => {
            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            expect(ndk.signer).toBe(signer);
        });

        it("should not set ndk.signer when logging in with a user (read-only)", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(user);

            expect(ndk.signer).toBeUndefined();
        });

        it("should update ndk.signer when switching sessions", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            expect(ndk.signer).toBe(signer2);

            manager.switchTo(user1.pubkey);

            expect(ndk.signer).toBe(signer1);
        });

        it("should clear ndk.signer when logging out last session", async () => {
            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            expect(ndk.signer).toBe(signer);

            manager.logout();

            expect(ndk.signer).toBeUndefined();
        });

        it("should not set ndk.signer when setActive is false", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();

            await manager.login(signer1, { setActive: true });
            expect(ndk.signer).toBe(signer1);

            await manager.login(signer2, { setActive: false });
            expect(ndk.signer).toBe(signer1);
        });
    });

    describe("filter management", () => {
        it("should set muteFilter when session has mutes", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            // Add muted pubkeys
            const mutedPubkey = "deadbeef";
            manager.getCurrentState().updateSession(user.pubkey, {
                muteSet: new Map([["deadbeef", "p"]]),
            });

            // Switch to trigger filter update
            manager.switchTo(user.pubkey);

            expect(ndk.muteFilter).toBeDefined();

            // Test filter blocks muted pubkey
            const mockEvent = { pubkey: mutedPubkey, content: "test" } as any;
            expect(ndk.muteFilter!(mockEvent)).toBe(true);
        });

        it("should set muteFilter to block muted words", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            // Add muted words
            manager.getCurrentState().updateSession(user.pubkey, {
                mutedWords: new Set(["spam", "scam"]),
            });

            manager.switchTo(user.pubkey);

            expect(ndk.muteFilter).toBeDefined();

            // Test filter blocks muted words
            const spamEvent = { pubkey: "test", content: "This is spam content" } as any;
            expect(ndk.muteFilter!(spamEvent)).toBe(true);

            const scamEvent = { pubkey: "test", content: "SCAM alert" } as any;
            expect(ndk.muteFilter!(scamEvent)).toBe(true);

            const normalEvent = { pubkey: "test", content: "Normal content" } as any;
            expect(ndk.muteFilter!(normalEvent)).toBe(false);
        });

        it("should clear muteFilter when switching to session without mutes", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            // Add mutes to user1
            manager.getCurrentState().updateSession(user1.pubkey, {
                muteSet: new Map([["deadbeef", "p"]]),
            });

            manager.switchTo(user1.pubkey);
            expect(ndk.muteFilter).toBeDefined();

            // Switch to user2 without mutes
            manager.switchTo(user2.pubkey);
            expect(ndk.muteFilter).toBeUndefined();
        });

        it("should set relayConnectionFilter when session has blocked relays", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            // Add blocked relays
            manager.getCurrentState().updateSession(user.pubkey, {
                blockedRelays: new Set(["wss://spam.relay"]),
            });

            manager.switchTo(user.pubkey);

            expect(ndk.relayConnectionFilter).toBeDefined();

            // Test filter blocks the relay
            expect(ndk.relayConnectionFilter!("wss://spam.relay")).toBe(false);
            expect(ndk.relayConnectionFilter!("wss://good.relay")).toBe(true);
        });

        it("should clear filters when logging out last session", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            manager.getCurrentState().updateSession(user.pubkey, {
                muteSet: new Map([["deadbeef", "p"]]),
                blockedRelays: new Set(["wss://spam.relay"]),
            });

            manager.switchTo(user.pubkey);
            expect(ndk.muteFilter).toBeDefined();
            expect(ndk.relayConnectionFilter).toBeDefined();

            manager.logout();

            expect(ndk.muteFilter).toBeUndefined();
            expect(ndk.relayConnectionFilter).toBeUndefined();
        });

        it("should clear filters when switching to null", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            manager.getCurrentState().updateSession(user.pubkey, {
                muteSet: new Map([["deadbeef", "p"]]),
            });

            manager.switchTo(user.pubkey);
            expect(ndk.muteFilter).toBeDefined();

            manager.switchTo(null);

            expect(ndk.muteFilter).toBeUndefined();
        });
    });

    describe("read-only sessions", () => {
        it("should return true for isReadOnly when session has no signer", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(user);

            expect(manager.isReadOnly()).toBe(true);
        });

        it("should return false for isReadOnly when session has signer", async () => {
            const signer = NDKPrivateKeySigner.generate();

            await manager.login(signer);

            expect(manager.isReadOnly()).toBe(false);
        });
    });

    describe("edge cases", () => {
        it("should throw when logging out with no active session", () => {
            expect(() => manager.logout()).toThrow();
        });

        it("should throw when switching to non-existent session", () => {
            expect(() => manager.switchTo("nonexistent")).toThrow();
        });
    });

    describe("wallet preferences", () => {
        it("should enable wallet for a session", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            expect(manager.isWalletEnabled()).toBe(false);

            manager.enableWallet();

            expect(manager.isWalletEnabled()).toBe(true);

            const session = manager.getSession(user.pubkey);
            expect(session?.preferences?.walletEnabled).toBe(true);
        });

        it("should disable wallet for a session", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            manager.enableWallet();
            expect(manager.isWalletEnabled()).toBe(true);

            manager.disableWallet();
            expect(manager.isWalletEnabled()).toBe(false);

            const session = manager.getSession(user.pubkey);
            expect(session?.preferences?.walletEnabled).toBe(false);
        });

        it("should enable wallet for a specific session", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            manager.enableWallet(user1.pubkey);

            expect(manager.isWalletEnabled(user1.pubkey)).toBe(true);
            expect(manager.isWalletEnabled(user2.pubkey)).toBe(false);
        });

        it("should persist wallet preferences", async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, { storage });

            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager1.login(signer);
            manager1.enableWallet();
            await manager1.persist();

            // Create new manager with same storage
            const manager2 = new NDKSessionManager(ndk, { storage });
            await manager2.restore();

            expect(manager2.isWalletEnabled(user.pubkey)).toBe(true);
        });

        it("should restore sessions with saved wallet preferences", async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, {
                storage,
                fetches: { follows: true },
            });

            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager1.login(signer);
            manager1.enableWallet();
            await manager1.persist();

            // Create new manager with same storage
            const manager2 = new NDKSessionManager(ndk, {
                storage,
                fetches: { follows: true },
            });

            // Spy on startSession to verify wallet is enabled
            const startSessionSpy = vi.spyOn(manager2.getCurrentState(), "startSession");

            await manager2.restore();

            // Verify wallet preference was loaded
            expect(manager2.isWalletEnabled(user.pubkey)).toBe(true);

            // Verify startSession was called with wallet: true
            expect(startSessionSpy).toHaveBeenCalledWith(user.pubkey, {
                follows: true,
                wallet: true,
            });
        });

        it("should respect saved wallet preference over default", async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, {
                storage,
                fetches: { wallet: false }, // default is false
            });

            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager1.login(signer);
            manager1.enableWallet(); // user enabled it
            await manager1.persist();

            // Create new manager with same default
            const manager2 = new NDKSessionManager(ndk, {
                storage,
                fetches: { wallet: false }, // default is still false
            });

            await manager2.restore();

            // Should use saved preference (true) instead of default (false)
            expect(manager2.isWalletEnabled(user.pubkey)).toBe(true);
        });

        it("should fall back to default when no preference is saved", async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, {
                storage,
                fetches: { wallet: true }, // default is true
            });

            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager1.login(signer);
            // Don't set any preference
            await manager1.persist();

            // Create new manager with same default
            const manager2 = new NDKSessionManager(ndk, {
                storage,
                fetches: { wallet: true },
            });

            await manager2.restore();

            // Should use default (true) since no preference was saved
            const startSessionSpy = vi.spyOn(manager2.getCurrentState(), "startSession");
            await manager2.restore();

            expect(startSessionSpy).toHaveBeenCalledWith(user.pubkey, {
                wallet: true,
            });
        });

        it("should return false for isWalletEnabled when no session is active", () => {
            expect(manager.isWalletEnabled()).toBe(false);
        });

        it("should handle enableWallet when no session is active", () => {
            // Should not throw
            expect(() => manager.enableWallet()).not.toThrow();
        });

        it("should handle disableWallet when no session is active", () => {
            // Should not throw
            expect(() => manager.disableWallet()).not.toThrow();
        });

        it("should handle enableWallet for non-existent session", () => {
            // Should not throw
            expect(() => manager.enableWallet("nonexistent")).not.toThrow();
        });
    });
});
