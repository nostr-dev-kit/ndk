import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../ndk/index.js";
import { NDKSubscription } from "../subscription/index.js";
import { chooseRelayCombinationForPubkeys } from "./index.js";
import { NIP66LivenessFilter } from "./nip66.js";

/**
 * Mock getRelaysForSync to return controlled relay sets per author.
 * This simulates outbox tracker data without needing real relay connections.
 */
const mockRelayData = new Map<string, Set<string>>();

vi.mock("./write.js", () => ({
    getRelaysForSync: vi.fn((ndk: any, pubkey: string) => {
        return mockRelayData.get(pubkey) ?? null;
    }),
    getWriteRelaysFor: vi.fn(async (ndk: any, pubkey: string) => {
        return mockRelayData.get(pubkey) ?? null;
    }),
}));

function setupMockRelayData(data: Record<string, string[]>) {
    mockRelayData.clear();
    for (const [pubkey, relays] of Object.entries(data)) {
        mockRelayData.set(pubkey, new Set(relays));
    }
}

describe("Integration: maxOutboxRelays", () => {
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK({
            explicitRelayUrls: ["wss://explicit.com/"],
            enableOutboxModel: false,
        });
    });

    it("maxOutboxRelays: 5 returns ≤5 unique relay URLs", () => {
        ndk.maxOutboxRelays = 5;

        // Set up 10 authors, each on 2-3 unique relays (many more than 5 total)
        setupMockRelayData({
            author1: ["wss://relay1.com/", "wss://relay2.com/"],
            author2: ["wss://relay2.com/", "wss://relay3.com/"],
            author3: ["wss://relay3.com/", "wss://relay4.com/"],
            author4: ["wss://relay5.com/", "wss://relay6.com/"],
            author5: ["wss://relay7.com/", "wss://relay8.com/"],
            author6: ["wss://relay9.com/", "wss://relay10.com/"],
            author7: ["wss://relay1.com/", "wss://relay11.com/"],
            author8: ["wss://relay12.com/", "wss://relay13.com/"],
            author9: ["wss://relay14.com/", "wss://relay15.com/"],
            author10: ["wss://relay16.com/", "wss://relay17.com/"],
        });

        const pubkeys = Array.from({ length: 10 }, (_, i) => `author${i + 1}`);
        const result = chooseRelayCombinationForPubkeys(ndk, pubkeys, "write");

        const uniqueRelays = new Set(result.keys());
        expect(uniqueRelays.size).toBeLessThanOrEqual(5);
    });

    it("returns more relays when maxOutboxRelays is not set", () => {
        // No cap
        ndk.maxOutboxRelays = undefined;

        setupMockRelayData({
            author1: ["wss://relay1.com/", "wss://relay2.com/"],
            author2: ["wss://relay3.com/", "wss://relay4.com/"],
            author3: ["wss://relay5.com/", "wss://relay6.com/"],
            author4: ["wss://relay7.com/", "wss://relay8.com/"],
        });

        const pubkeys = ["author1", "author2", "author3", "author4"];
        const result = chooseRelayCombinationForPubkeys(ndk, pubkeys, "write");

        const uniqueRelays = new Set(result.keys());
        // Without a cap, should use more than 5 relays for 4 authors × 2 relays each
        expect(uniqueRelays.size).toBeGreaterThan(4);
    });
});

describe("Integration: Thompson priors populate after EOSE", () => {
    // Valid 64-char hex pubkeys for filter validation
    const ALICE = "a".repeat(64);
    const BOB = "b".repeat(64);
    const SOLE = "c".repeat(64);
    const MULTI = "d".repeat(64);

    it("observeDelivery updates Thompson priors from relay attribution data", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.com/"],
            enableOutboxModel: false,
            enableThompsonSampling: true,
        });

        expect(ndk.thompsonSampler).toBeDefined();
        expect(ndk.thompsonSampler!.relayScores.size).toBe(0);

        // Create a subscription with closeOnEose
        const sub = new NDKSubscription(
            ndk,
            [{ kinds: [1], authors: [ALICE, BOB] }],
            { closeOnEose: true },
        );

        // Simulate what startWithRelays would set up
        sub.authorRelayAssignments = new Map([
            ["wss://relay-a.com/", [ALICE, BOB]],
            ["wss://relay-b.com/", [BOB]],
        ]);
        sub.pubkeysToRelays = new Map([
            [ALICE, new Set(["wss://relay-a.com/"])],
            [BOB, new Set(["wss://relay-a.com/", "wss://relay-b.com/"])],
        ]);

        // Simulate relay attribution tracking (what eventReceived would do)
        // relay-a delivered events for ALICE and BOB
        // relay-b delivered nothing for BOB
        (sub as any)._receivedAuthorsByRelay = new Map([
            [ALICE, new Set(["wss://relay-a.com/"])],
            [BOB, new Set(["wss://relay-a.com/"])],
        ]);

        // Set up relayFilters so eoseReceived can compute hasSeenAllEoses
        sub.relayFilters = new Map([
            ["wss://relay-a.com/", [{ kinds: [1], authors: [ALICE, BOB] }]],
            ["wss://relay-b.com/", [{ kinds: [1], authors: [BOB] }]],
        ]);

        // Mock the pool so eoseReceived doesn't fail
        const mockRelay = (url: string) => ({ url, status: 1 } as any);
        sub.eosesSeen.add(mockRelay("wss://relay-a.com/"));
        sub.eosesSeen.add(mockRelay("wss://relay-b.com/"));

        // Trigger observeDelivery directly (normally called from performEose)
        (sub as any).observeDelivery();

        // Verify Thompson priors were updated
        const scores = ndk.thompsonSampler!.relayScores;
        expect(scores.size).toBeGreaterThan(0);

        // relay-a delivered for both alice and bob → should have successes
        const relayA = scores.get("wss://relay-a.com/");
        expect(relayA).toBeDefined();
        expect(relayA!.alpha).toBeGreaterThan(1); // had deliveries

        // relay-b was assigned bob but didn't deliver → should have failure
        const relayB = scores.get("wss://relay-b.com/");
        expect(relayB).toBeDefined();
        expect(relayB!.beta).toBeGreaterThan(1); // had a miss
    });

    it("skips observation on non-closeOnEose subscriptions", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.com/"],
            enableOutboxModel: false,
            enableThompsonSampling: true,
        });

        // closeOnEose: false (long-running subscription)
        const sub = new NDKSubscription(
            ndk,
            [{ kinds: [1], authors: [ALICE] }],
            { closeOnEose: false },
        );

        sub.authorRelayAssignments = new Map([
            ["wss://relay-a.com/", [ALICE]],
        ]);
        (sub as any)._receivedAuthorsByRelay = new Map([
            [ALICE, new Set(["wss://relay-a.com/"])],
        ]);

        (sub as any).observeDelivery();

        // Should NOT have updated priors — P2 says only observe finite subs
        expect(ndk.thompsonSampler!.relayScores.size).toBe(0);
    });

    it("applies 0.3x weight for sole-source authors", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.com/"],
            enableOutboxModel: false,
            enableThompsonSampling: true,
        });

        const sub = new NDKSubscription(
            ndk,
            [{ kinds: [1], authors: [SOLE, MULTI] }],
            { closeOnEose: true },
        );

        sub.authorRelayAssignments = new Map([
            ["wss://relay-a.com/", [SOLE, MULTI]],
        ]);
        sub.pubkeysToRelays = new Map([
            [SOLE, new Set(["wss://relay-a.com/"])],           // sole-source
            [MULTI, new Set(["wss://relay-a.com/", "wss://other.com/"])], // multi-relay
        ]);

        (sub as any)._receivedAuthorsByRelay = new Map([
            [SOLE, new Set(["wss://relay-a.com/"])],
            [MULTI, new Set(["wss://relay-a.com/"])],
        ]);

        (sub as any).observeDelivery();

        const relayA = ndk.thompsonSampler!.relayScores.get("wss://relay-a.com/")!;
        // sole delivered with weight 0.3, multi delivered with weight 1.0
        // Before decay: alpha = 1 + 0.3 + 1.0 = 2.3
        // After decay (0.95): alpha = 1 + (2.3 - 1) * 0.95 = 2.235
        expect(relayA.alpha).toBeCloseTo(2.235, 5);
    });
});

describe("Integration: NIP-66 passes through on empty/stale monitor data", () => {
    it("filterAlive returns input unchanged when no refresh has been called", () => {
        const ndk = new NDK({ enableOutboxModel: false });
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.com/"],
        });

        const relays = new Set(["wss://maybe-dead.com/", "wss://alive.com/"]);
        const result = filter.filterAlive(relays);

        // No data fetched → pass-through
        expect(result).toEqual(relays);
    });

    it("NIP-66 integrated into outbox selection preserves authors on empty data", () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://explicit.com/"],
            enableOutboxModel: false,
            nip66MonitorRelays: ["wss://monitor.com/"],
        });

        expect(ndk.nip66Filter).toBeDefined();

        // NIP-66 has no data (refresh not called) → filtering should pass through
        setupMockRelayData({
            author1: ["wss://relay1.com/", "wss://relay2.com/"],
        });

        const result = chooseRelayCombinationForPubkeys(ndk, ["author1"], "write");

        // Author should still have relay assignments despite NIP-66 being configured
        expect(result.size).toBeGreaterThan(0);
    });
});
