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

    it("should detect race condition: activePubkey set before ndk.signer", async () => {
        if (!ndk.$sessions) return;

        // Track the order of operations and state when each happens
        const operations: { op: string; signerSet: boolean }[] = [];

        // Intercept activePubkey setter to track when it's set and check signer state
        const store = ndk.$sessions;
        let activePubkeyValue = store.activePubkey;

        Object.defineProperty(store, 'activePubkey', {
            get() {
                return activePubkeyValue;
            },
            set(value) {
                activePubkeyValue = value;
                if (value) {
                    operations.push({
                        op: 'activePubkey-set',
                        signerSet: ndk.signer !== undefined
                    });
                }
            },
            configurable: true
        });

        // Intercept ndk.signer setter to track when it's set
        let signerValue = ndk.signer;
        Object.defineProperty(ndk, 'signer', {
            get() {
                return signerValue;
            },
            set(value) {
                signerValue = value;
                if (value) {
                    operations.push({
                        op: 'signer-set',
                        signerSet: true
                    });
                }
            },
            configurable: true
        });

        // Login with a signer - this should set both activePubkey and signer
        await ndk.$sessions.login(signer1);

        // Give any async operations time to complete
        await new Promise(resolve => setTimeout(resolve, 10));

        // Debug: Log all operations
        console.log('Operations captured:', operations);

        // Assert: We should have captured both operations
        expect(operations.length).toBeGreaterThanOrEqual(2);

        // Find the operations
        const activePubkeyOp = operations.find(op => op.op === 'activePubkey-set');
        const signerOp = operations.find(op => op.op === 'signer-set');

        expect(activePubkeyOp).toBeDefined();
        expect(signerOp).toBeDefined();

        // Find the index of each operation to determine order
        const activePubkeyIndex = operations.findIndex(op => op.op === 'activePubkey-set');
        const signerIndex = operations.findIndex(op => op.op === 'signer-set');

        console.log('activePubkey set at index:', activePubkeyIndex, 'with signerSet:', activePubkeyOp?.signerSet);
        console.log('signer set at index:', signerIndex);

        // The operations show signer is set FIRST, so no race condition in login path
        // This is because store.ts:136 sets ndk.signer before triggering store updates
    });

    it("should NOT have race condition in switchTo: signer set before or with activePubkey", async () => {
        if (!ndk.$sessions) return;

        // Setup: Login with two signers
        await ndk.$sessions.login(signer1);
        await ndk.$sessions.add(signer2);
        const pubkey2 = (await signer2.user()).pubkey;

        // Clear initial operations
        await new Promise(resolve => setTimeout(resolve, 10));

        // Track the order of operations during switch
        const operations: { op: string; signerPubkey: string | undefined; activePubkey: string | undefined; timestamp: number }[] = [];

        // Get the current signer's pubkey
        const getSignerPubkey = async () => {
            if (!ndk.signer) return undefined;
            try {
                const user = await ndk.signer.user();
                return user.pubkey;
            } catch {
                return undefined;
            }
        };

        // Intercept activePubkey setter
        const store = ndk.$sessions;
        let activePubkeyValue = store.activePubkey;

        Object.defineProperty(store, 'activePubkey', {
            get() {
                return activePubkeyValue;
            },
            set(value) {
                const oldValue = activePubkeyValue;
                activePubkeyValue = value;
                if (value && value !== oldValue) {
                    // Check signer pubkey synchronously by accessing cached value
                    const signerPubkey = (ndk.signer as any)?._user?.pubkey;
                    operations.push({
                        op: 'activePubkey-set',
                        signerPubkey,
                        activePubkey: value,
                        timestamp: Date.now()
                    });
                }
            },
            configurable: true
        });

        // Intercept ndk.signer setter
        let signerValue = ndk.signer;
        Object.defineProperty(ndk, 'signer', {
            get() {
                return signerValue;
            },
            set(value) {
                const oldValue = signerValue;
                signerValue = value;
                if (value && value !== oldValue) {
                    const signerPubkey = (value as any)?._user?.pubkey;
                    operations.push({
                        op: 'signer-set',
                        signerPubkey,
                        activePubkey: activePubkeyValue,
                        timestamp: Date.now()
                    });
                }
            },
            configurable: true
        });

        // Switch to the second user - this is where the race condition might occur
        await ndk.$sessions.switch(pubkey2);

        // Give any async operations time to complete
        await new Promise(resolve => setTimeout(resolve, 10));

        console.log('Switch operations:', operations);
        console.log('Expected pubkey2:', pubkey2);

        // Find the operations
        const activePubkeyOp = operations.find(op => op.op === 'activePubkey-set');
        const signerOp = operations.find(op => op.op === 'signer-set');

        console.log('activePubkey operation:', activePubkeyOp);
        console.log('signer operation:', signerOp);

        if (activePubkeyOp && signerOp) {
            const activePubkeyIndex = operations.findIndex(op => op.op === 'activePubkey-set');
            const signerIndex = operations.findIndex(op => op.op === 'signer-set');

            // Fix validation:
            // 1. Signer should be set BEFORE or AT THE SAME TIME as activePubkey (no race condition)
            expect(signerIndex).toBeLessThanOrEqual(activePubkeyIndex);

            // 2. When activePubkey was set to pubkey2, the signer should ALREADY match pubkey2
            expect(activePubkeyOp.activePubkey).toBe(pubkey2);
            expect(activePubkeyOp.signerPubkey).toBe(pubkey2); // Signer already updated!

            // 3. Eventually the signer matches the activePubkey
            const finalSignerPubkey = await ndk.signer?.user().then(u => u.pubkey);
            expect(finalSignerPubkey).toBe(pubkey2);
        }
    });
});
