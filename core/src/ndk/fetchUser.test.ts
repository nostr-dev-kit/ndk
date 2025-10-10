import { nip19 } from "nostr-tools";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDKUser } from "../user/index.js";
import * as nip05Module from "../user/nip05.js";
import { NDK } from "./index.js";

describe("ndk.fetchUser()", () => {
    let ndk: NDK;
    const testPubkey = "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d";
    const testNpub = nip19.npubEncode(testPubkey);
    const testNprofile = nip19.nprofileEncode({
        pubkey: testPubkey,
        relays: ["wss://relay1.example.com", "wss://relay2.example.com"],
    });

    beforeEach(() => {
        ndk = new NDK();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("with npub string", () => {
        it("should decode npub and create user with correct pubkey", async () => {
            const user = await ndk.fetchUser(testNpub);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(testPubkey);
            expect(user?.ndk).toBe(ndk);
        });

        it("should throw error for invalid npub", async () => {
            await expect(ndk.fetchUser("npub1invalid")).rejects.toThrow();
        });
    });

    describe("with nprofile string", () => {
        it("should decode nprofile and create user with pubkey and relay hints", async () => {
            const user = await ndk.fetchUser(testNprofile);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(testPubkey);
            expect(user?.relayUrls).toEqual(["wss://relay1.example.com", "wss://relay2.example.com"]);
            expect(user?.ndk).toBe(ndk);
        });

        it("should handle nprofile without relays", async () => {
            const nprofileNoRelays = nip19.nprofileEncode({
                pubkey: testPubkey,
                relays: [],
            });
            const user = await ndk.fetchUser(nprofileNoRelays);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(testPubkey);
            expect(user?.relayUrls).toEqual([]);
        });
    });

    describe("with hex pubkey string", () => {
        it("should accept hex pubkey directly", async () => {
            const user = await ndk.fetchUser(testPubkey);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(testPubkey);
            expect(user?.ndk).toBe(ndk);
        });

        it("should handle various hex pubkey formats", async () => {
            const shortHex = "deadbeef";
            const user = await ndk.fetchUser(shortHex);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(shortHex);
        });
    });

    describe("with NIP-05 identifier", () => {
        it("should resolve NIP-05 with @ symbol", async () => {
            const mockUser = new NDKUser({ pubkey: testPubkey });
            mockUser.ndk = ndk;

            vi.spyOn(NDKUser, "fromNip05").mockResolvedValue(mockUser);

            const user = await ndk.fetchUser("pablo@test.com");
            expect(NDKUser.fromNip05).toHaveBeenCalledWith("pablo@test.com", ndk, false);
            expect(user).toBe(mockUser);
        });

        it("should resolve NIP-05 without @ symbol (domain only)", async () => {
            const mockUser = new NDKUser({ pubkey: testPubkey });
            mockUser.ndk = ndk;

            vi.spyOn(NDKUser, "fromNip05").mockResolvedValue(mockUser);

            const user = await ndk.fetchUser("test.com");
            expect(NDKUser.fromNip05).toHaveBeenCalledWith("test.com", ndk, false);
            expect(user).toBe(mockUser);
        });

        it("should handle NIP-05 resolution failure", async () => {
            vi.spyOn(NDKUser, "fromNip05").mockResolvedValue(undefined);

            const user = await ndk.fetchUser("nonexistent@test.com");
            expect(NDKUser.fromNip05).toHaveBeenCalledWith("nonexistent@test.com", ndk, false);
            expect(user).toBeUndefined();
        });

        it("should pass skipCache parameter for NIP-05", async () => {
            const mockUser = new NDKUser({ pubkey: testPubkey });
            mockUser.ndk = ndk;

            vi.spyOn(NDKUser, "fromNip05").mockResolvedValue(mockUser);

            await ndk.fetchUser("pablo@test.com", true);
            expect(NDKUser.fromNip05).toHaveBeenCalledWith("pablo@test.com", ndk, true);
        });

        it("should distinguish between NIP-05 and nprofile with dots", async () => {
            // nprofile should not be mistaken for NIP-05 even if it contains dots somehow
            const user = await ndk.fetchUser(testNprofile);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(testPubkey);
        });
    });

    describe("edge cases", () => {
        it("should handle empty string", async () => {
            const user = await ndk.fetchUser("");
            expect(user).toBeInstanceOf(NDKUser);
            // Empty string is not a valid pubkey, so accessing pubkey should throw
            expect(() => user?.pubkey).toThrow("npub not set");
        });

        it("should handle strings starting with 'n' but not valid NIP-19", async () => {
            const invalidString = "notanip19string";
            const user = await ndk.fetchUser(invalidString);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user?.pubkey).toBe(invalidString);
        });

        it("should handle domain with multiple dots", async () => {
            const mockUser = new NDKUser({ pubkey: testPubkey });
            mockUser.ndk = ndk;

            vi.spyOn(NDKUser, "fromNip05").mockResolvedValue(mockUser);

            const user = await ndk.fetchUser("sub.domain.test.com");
            expect(NDKUser.fromNip05).toHaveBeenCalledWith("sub.domain.test.com", ndk, false);
            expect(user).toBe(mockUser);
        });
    });
});
