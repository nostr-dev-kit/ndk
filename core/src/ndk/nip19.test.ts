import { nip19 } from "nostr-tools";
import { NDKUser } from "../user/index.js";
import { NDK } from "./index.js";

describe("ndk.getUser() with NIP-19 strings", () => {
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

    describe("with npub string", () => {
        it("should decode npub and create user with correct pubkey", () => {
            const user = ndk.getUser(testNpub);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe(testPubkey);
            expect(user.ndk).toBe(ndk);
        });

        it("should throw error for invalid npub", () => {
            expect(() => ndk.getUser("npub1invalid")).toThrow();
        });
    });

    describe("with nprofile string", () => {
        it("should decode nprofile and create user with pubkey and relay hints", () => {
            const user = ndk.getUser(testNprofile);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe(testPubkey);
            expect(user.relayUrls).toEqual(["wss://relay1.example.com", "wss://relay2.example.com"]);
            expect(user.ndk).toBe(ndk);
        });

        it("should handle nprofile without relays", () => {
            const nprofileNoRelays = nip19.nprofileEncode({
                pubkey: testPubkey,
                relays: [],
            });
            const user = ndk.getUser(nprofileNoRelays);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe(testPubkey);
            expect(user.relayUrls).toEqual([]);
        });
    });

    describe("with hex pubkey string", () => {
        it("should accept hex pubkey directly", () => {
            const user = ndk.getUser(testPubkey);
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe(testPubkey);
            expect(user.ndk).toBe(ndk);
        });
    });

    describe("with object parameter (backward compatibility)", () => {
        it("should work with traditional object parameter", () => {
            const user = ndk.getUser({ pubkey: testPubkey });
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe(testPubkey);
            expect(user.ndk).toBe(ndk);
        });

        it("should work with npub in object", () => {
            const user = ndk.getUser({ npub: testNpub });
            expect(user).toBeInstanceOf(NDKUser);
            expect(user.pubkey).toBe(testPubkey);
            expect(user.ndk).toBe(ndk);
        });
    });
});

describe("nip19 module export", () => {
    it("should export nip19 utilities from NDK", async () => {
        const ndk = await import("../index.js");
        expect(ndk.nip19).toBeDefined();
        expect(ndk.nip19.npubEncode).toBeDefined();
        expect(ndk.nip19.decode).toBeDefined();
        expect(ndk.nip19.neventEncode).toBeDefined();
        expect(ndk.nip19.naddrEncode).toBeDefined();
    });

    it("should encode and decode npub correctly", async () => {
        const { nip19 } = await import("../index.js");
        const testPubkey = "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d";

        const encoded = nip19.npubEncode(testPubkey);
        expect(encoded).toMatch(/^npub1/);

        const decoded = nip19.decode(encoded);
        expect(decoded.type).toBe("npub");
        expect(decoded.data).toBe(testPubkey);
    });

    it("should encode and decode other NIP-19 types", async () => {
        const { nip19 } = await import("../index.js");

        // Test note encoding
        const noteId = "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d";
        const noteEncoded = nip19.noteEncode(noteId);
        expect(noteEncoded).toMatch(/^note1/);

        // Test nevent encoding
        const neventData = {
            id: noteId,
            relays: ["wss://relay.example.com"],
            author: "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
        };
        const neventEncoded = nip19.neventEncode(neventData);
        expect(neventEncoded).toMatch(/^nevent1/);

        // Test decoding
        const neventDecoded = nip19.decode(neventEncoded);
        expect(neventDecoded.type).toBe("nevent");
        expect(neventDecoded.data.id).toBe(noteId);
    });
});
