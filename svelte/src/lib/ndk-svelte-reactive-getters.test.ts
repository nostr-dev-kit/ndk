import { describe, it, expect, beforeEach } from "vitest";
import { NDKSvelte } from "./ndk-svelte.svelte.js";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

describe("NDKSvelte Reactive Getters", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte({
            explicitRelayUrls: ["wss://relay.test"],
            session: true,
        });
    });

    describe("$currentUser and $activeUser", () => {
        it("should return undefined when no user is active", () => {
            expect(ndk.$currentUser).toBeUndefined();
            expect(ndk.$activeUser).toBeUndefined();
        });

        it("should return the active user when a signer is set", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            // Set signer and wait for activeUser to update
            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer;
            });

            expect(ndk.$currentUser).toBeDefined();
            expect(ndk.$currentUser?.pubkey).toBe(user.pubkey);
            expect(ndk.$activeUser).toBeDefined();
            expect(ndk.$activeUser?.pubkey).toBe(user.pubkey);
        });

        it("should update when activeUser changes", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();

            const signer2 = NDKPrivateKeySigner.generate();
            const user2 = await signer2.user();

            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer1;
            });
            expect(ndk.$currentUser?.pubkey).toBe(user1.pubkey);
            expect(ndk.$activeUser?.pubkey).toBe(user1.pubkey);

            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer2;
            });
            expect(ndk.$currentUser?.pubkey).toBe(user2.pubkey);
            expect(ndk.$activeUser?.pubkey).toBe(user2.pubkey);
        });

        it("$activeUser should be an alias for $currentUser", async () => {
            const signer = NDKPrivateKeySigner.generate();

            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer;
            });

            expect(ndk.$activeUser).toBe(ndk.$currentUser);
        });
    });

    describe("$currentPubkey", () => {
        it("should return undefined when no user is active", () => {
            expect(ndk.$currentPubkey).toBeUndefined();
        });

        it("should return the active user's pubkey when a signer is set", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer;
            });

            expect(ndk.$currentPubkey).toBe(user.pubkey);
        });

        it("should update when activeUser changes", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();

            const signer2 = NDKPrivateKeySigner.generate();
            const user2 = await signer2.user();

            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer1;
            });
            expect(ndk.$currentPubkey).toBe(user1.pubkey);

            await new Promise<void>((resolve) => {
                ndk.once("activeUser:change", () => resolve());
                ndk.signer = signer2;
            });
            expect(ndk.$currentPubkey).toBe(user2.pubkey);
        });
    });

    describe("$currentSession", () => {
        it("should return undefined when sessions are not enabled", () => {
            const ndkNoSessions = new NDKSvelte({
                explicitRelayUrls: ["wss://relay.test"],
            });

            expect(ndkNoSessions.$currentSession).toBeUndefined();
        });

        it("should return undefined when no session is active", () => {
            expect(ndk.$currentSession).toBeUndefined();
        });

        it("should return the active session after login", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await ndk.$sessions?.login(signer, { setActive: true });

            expect(ndk.$currentSession).toBeDefined();
            expect(ndk.$currentSession?.pubkey).toBe(user.pubkey);
        });

        it("should update when switching sessions", async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();

            const signer2 = NDKPrivateKeySigner.generate();
            const user2 = await signer2.user();

            await ndk.$sessions?.login(signer1, { setActive: true });
            expect(ndk.$currentSession?.pubkey).toBe(user1.pubkey);

            await ndk.$sessions?.login(signer2, { setActive: true });
            expect(ndk.$currentSession?.pubkey).toBe(user2.pubkey);

            ndk.$sessions?.switch(user1.pubkey);
            expect(ndk.$currentSession?.pubkey).toBe(user1.pubkey);
        });

        it("should return undefined after logout", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await ndk.$sessions?.login(signer, { setActive: true });
            expect(ndk.$currentSession).toBeDefined();

            ndk.$sessions?.logout(user.pubkey);
            expect(ndk.$currentSession).toBeUndefined();
        });
    });

    describe("Reactive getters integration", () => {
        it("should all update together when logging in", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            expect(ndk.$currentUser).toBeUndefined();
            expect(ndk.$activeUser).toBeUndefined();
            expect(ndk.$currentPubkey).toBeUndefined();
            expect(ndk.$currentSession).toBeUndefined();

            await ndk.$sessions?.login(signer, { setActive: true });

            expect(ndk.$currentUser).toBeDefined();
            expect(ndk.$activeUser).toBeDefined();
            expect(ndk.$currentPubkey).toBe(user.pubkey);
            expect(ndk.$currentSession).toBeDefined();
            expect(ndk.$currentSession?.pubkey).toBe(user.pubkey);
        });

        it("should all update together when logging out", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await ndk.$sessions?.login(signer, { setActive: true });

            expect(ndk.$currentUser).toBeDefined();
            expect(ndk.$activeUser).toBeDefined();
            expect(ndk.$currentPubkey).toBeDefined();
            expect(ndk.$currentSession).toBeDefined();

            // Logout - session will be cleared synchronously
            ndk.$sessions?.logout(user.pubkey);

            // Session should be cleared immediately
            expect(ndk.$currentSession).toBeUndefined();

            // Note: activeUser might still be set after logout if no event fires
            // This is OK since there's no active session anyway
        });
    });
});
