import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { createNDK, type NDKSvelte } from "../ndk-svelte.svelte";

describe("SessionsStore", () => {
    let ndk: NDKSvelte;
    let signer1: NDKPrivateKeySigner;
    let signer2: NDKPrivateKeySigner;

    beforeEach(async () => {
        ndk = createNDK({ explicitRelayUrls: ["wss://relay.test"], session: true });

        // Create test signers
        signer1 = NDKPrivateKeySigner.generate();
        signer2 = NDKPrivateKeySigner.generate();
    });

    it("should initialize with no sessions", () => {
        if (!ndk.$sessions) return;
        expect(ndk.$sessions.all).toEqual([]);
        expect(ndk.$sessions.current).toBeUndefined();
    });

    it("should login and create a session", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);

        expect(ndk.$sessions.all.length).toBe(1);
        expect(ndk.$sessions.current).toBeDefined();
        expect(ndk.$sessions.current?.pubkey).toBe((await signer1.user()).pubkey);
    });

    it("should add multiple sessions", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);
        await ndk.$sessions.add(signer2);

        expect(ndk.$sessions.all.length).toBe(2);
        expect(ndk.$sessions.current?.pubkey).toBe((await signer1.user()).pubkey);
    });

    it("should switch between sessions", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);
        await ndk.$sessions.add(signer2);

        const pubkey2 = (await signer2.user()).pubkey;
        await ndk.$sessions.switch(pubkey2);

        expect(ndk.$sessions.current?.pubkey).toBe(pubkey2);
    });

    it("should logout specific session", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);
        await ndk.$sessions.add(signer2);

        const pubkey1 = (await signer1.user()).pubkey;
        ndk.$sessions.logout(pubkey1);

        expect(ndk.$sessions.all.length).toBe(1);
        expect(ndk.$sessions.current?.pubkey).toBe((await signer2.user()).pubkey);
    });

    it("should logout all sessions", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);
        await ndk.$sessions.add(signer2);

        ndk.$sessions.logoutAll();

        expect(ndk.$sessions.all).toEqual([]);
        expect(ndk.$sessions.current).toBeUndefined();
    });

    it("should get session by pubkey", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);
        await ndk.$sessions.add(signer2);

        const pubkey1 = (await signer1.user()).pubkey;
        const session = ndk.$sessions.get(pubkey1);

        expect(session).toBeDefined();
        expect(session?.pubkey).toBe(pubkey1);
    });

    it("should return undefined for non-existent session", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);

        const session = ndk.$sessions.get("nonexistent-pubkey");

        expect(session).toBeUndefined();
    });

    it("should provide reactive follows accessor", async () => {
        if (!ndk.$sessions) return;
        await ndk.$sessions.login(signer1);

        expect(ndk.$sessions.follows).toBeDefined();
        expect(ndk.$sessions.follows.size).toBe(0);
        // FollowsProxy implements Set-like interface
        expect(typeof ndk.$sessions.follows.add).toBe('function');
        expect(typeof ndk.$sessions.follows.has).toBe('function');
    });

    it("should return empty set when no session", () => {
        if (!ndk.$sessions) return;
        expect(ndk.$sessions.follows).toBeDefined();
        expect(ndk.$sessions.follows.size).toBe(0);
        // FollowsProxy implements Set-like interface
        expect(typeof ndk.$sessions.follows.add).toBe('function');
        expect(typeof ndk.$sessions.follows.has).toBe('function');
    });
});
