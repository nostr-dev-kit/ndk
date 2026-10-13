/**
 * Regression tests: a failed NIP-77 negotiation must fall back to fetchEvents instead of
 * being reported as a successful (empty) sync.
 *
 * These run the real syncAndSubscribe / NDKSync / ndkSync / SyncSession code against a local
 * relay on 127.0.0.1 (see helpers/local-relay.ts). Nothing in the sync path is mocked.
 */
import NDK, { type NDKCacheAdapter, type NDKEvent, type NDKRelay } from "@nostr-dev-kit/ndk";
import { afterEach, describe, expect, test, vi } from "vitest";
import { NDKSync } from "../ndk-sync-class.js";
import { syncAndSubscribe } from "../sync-subscribe.js";
import {
    connectedRelay,
    type LocalRelay,
    type LocalRelayMode,
    makeSignedEvents,
    startLocalRelay,
    TestCacheAdapter,
    waitFor,
} from "./helpers/local-relay.js";

type Callback =
    | { name: "onRelaySynced"; count: number }
    | { name: "onRelayError"; message: string }
    | { name: "onSyncComplete" };

async function setup(mode: LocalRelayMode, nip77: boolean, extra: { eose?: boolean; aiGuardrails?: boolean } = {}) {
    const { pubkey, events } = makeSignedEvents(3);
    const relay = await startLocalRelay({ mode, nip77, events, eose: extra.eose });
    const cache = new TestCacheAdapter();
    const ndk = new NDK({
        explicitRelayUrls: [relay.url],
        cacheAdapter: cache as unknown as NDKCacheAdapter,
        enableOutboxModel: false,
        aiGuardrails: extra.aiGuardrails ?? false,
    });
    active = { relay, ndk };
    const ndkRelay = await connectedRelay(ndk);

    const callbacks: Callback[] = [];
    const received: string[] = [];
    let complete = false;
    const opts = {
        onEvent: (event: NDKEvent) => {
            received.push(event.id);
        },
        onRelaySynced: (_r: NDKRelay, count: number) => callbacks.push({ name: "onRelaySynced", count }),
        onRelayError: (_r: NDKRelay, error: Error) => {
            callbacks.push({ name: "onRelayError", message: error.message });
        },
        onSyncComplete: () => {
            callbacks.push({ name: "onSyncComplete" });
            complete = true;
        },
    };
    const filter = { kinds: [1], authors: [pubkey] };
    const expectedIds = events.map((e) => e.id).sort();
    const cachedIds = () => [...cache.events.keys()].sort();
    const fallbackRequests = () =>
        relay.received.filter((m) => m[0] === "REQ" && String(m[1]).startsWith("sync-fetch")).length;
    const negOpens = () => relay.received.filter((m) => m[0] === "NEG-OPEN").length;

    return {
        relay,
        ndk,
        ndkRelay,
        cache,
        opts,
        filter,
        expectedIds,
        cachedIds,
        callbacks,
        received,
        fallbackRequests,
        negOpens,
        done: () => complete,
    };
}

let active: { relay: LocalRelay; ndk: NDK } | undefined;
afterEach(async () => {
    if (!active) return;
    for (const relay of active.ndk.pool.relays.values()) relay.disconnect();
    await active.relay.close();
    active = undefined;
});

describe("syncAndSubscribe() fallback after a failed NIP-77 negotiation", () => {
    test.each<[string, LocalRelayMode]>([
        ["relay answers NEG-OPEN with NOTICE", "notice"],
        ["relay answers NEG-OPEN with NEG-ERR", "neg-err"],
    ])("%s -> fetchEvents fallback recovers the history", async (_label, mode) => {
        const s = await setup(mode, mode !== "notice");

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        await waitFor(s.done);

        expect(s.negOpens()).toBe(1);
        expect(s.fallbackRequests()).toBe(1);
        expect(s.cachedIds()).toEqual(s.expectedIds);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
        // the recovered events reach the consumer's subscription, once each
        expect([...s.received].sort()).toEqual(s.expectedIds);
    });

    test("negotiation fails and the fallback fails too -> onRelayError once, no onRelaySynced", async () => {
        const s = await setup("notice", false);
        vi.spyOn(s.ndk, "fetchEvents").mockRejectedValueOnce(new Error("fetch exploded"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        await waitFor(s.done);

        expect(s.callbacks).toEqual([{ name: "onRelayError", message: "fetch exploded" }, { name: "onSyncComplete" }]);
        consoleError.mockRestore();
    });

    test("characterization: fallback REQ never gets EOSE -> fetchEvents does not resolve, no terminal callback", async () => {
        // Known limitation (not addressed here): with a single relay NDK adds no EOSE timeout, so the
        // fallback hangs instead of resolving with a partial set. Neither onRelaySynced nor
        // onRelayError nor onSyncComplete fires. Events the relay did send still reach the cache.
        const s = await setup("notice", false, { eose: false });

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        // Observable progress: the fallback REQ went out and all three events came back and were cached.
        await waitFor(() => s.fallbackRequests() === 1 && s.cachedIds().length === 3);

        expect(s.cachedIds()).toEqual(s.expectedIds);
        // ...but without EOSE nothing terminal ever fires.
        expect(s.callbacks).toEqual([]);
    });

    test("aiGuardrails enabled: fallback bypasses only 'fetch-events-usage' and still recovers", async () => {
        const s = await setup("notice", false, { aiGuardrails: true });
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        // The feed-filter guardrail only fires once >6 calls were made and >50% of them are fetchEvents
        // (shouldWarnAboutFetchEventsRatio). Put the instance in that state and prove a direct call throws.
        for (let i = 0; i < 20; i++) s.ndk.aiGuardrails.incrementFetchEventsCount();
        await expect(s.ndk.fetchEvents(s.filter)).rejects.toThrow(/fetch-events-usage/);

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        await waitFor(s.done);

        expect(s.fallbackRequests()).toBe(1);
        expect(s.cachedIds()).toEqual(s.expectedIds);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
        // The exemption was for one call only; guardrails are still enabled afterwards.
        expect(s.ndk.aiGuardrails.isEnabled()).toBe(true);
        expect(s.ndk.aiGuardrails.shouldCheck("fetch-events-usage")).toBe(true);
        expect(s.ndk.aiGuardrails.shouldCheck("filter-large-limit")).toBe(true);
        consoleError.mockRestore();
    });

    test("relay with working NIP-77 -> synced through Negentropy, no fallback, no error", async () => {
        const s = await setup("negentropy", true);

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        await waitFor(s.done);

        expect(s.relay.received.some((m) => m[0] === "NEG-CLOSE")).toBe(true);
        expect(s.fallbackRequests()).toBe(0);
        expect(s.cachedIds()).toEqual(s.expectedIds);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
    });
});

describe("consumer callback exceptions are isolated from sync outcome classification", () => {
    test("function: onRelaySynced throws after a successful NIP-77 sync -> no fallback, no onRelayError, called once", async () => {
        const s = await setup("negentropy", true);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        s.opts.onRelaySynced = (_r: NDKRelay, count: number) => {
            s.callbacks.push({ name: "onRelaySynced", count });
            throw new Error("consumer onRelaySynced exploded");
        };

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        await waitFor(s.done);

        expect(s.fallbackRequests()).toBe(0);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
        expect(consoleError.mock.calls.some((c) => String(c[1]).includes("consumer onRelaySynced exploded"))).toBe(
            true,
        );
        consoleError.mockRestore();
    });

    test("class: onRelaySynced throws after a successful NIP-77 sync -> no onRelayError, called once", async () => {
        const s = await setup("negentropy", true);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        s.opts.onRelaySynced = (_r: NDKRelay, count: number) => {
            s.callbacks.push({ name: "onRelaySynced", count });
            throw new Error("consumer onRelaySynced exploded");
        };

        await new NDKSync(s.ndk).syncAndSubscribe(s.filter, s.opts);
        await waitFor(s.done);

        expect(s.fallbackRequests()).toBe(0);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
        expect(consoleError.mock.calls.some((c) => String(c[1]).includes("consumer onRelaySynced exploded"))).toBe(
            true,
        );
        consoleError.mockRestore();
    });

    test("function: onRelayError throws on a definitive failure -> onSyncComplete still fires, no unhandled rejection", async () => {
        const s = await setup("notice", false);
        vi.spyOn(s.ndk, "fetchEvents").mockRejectedValueOnce(new Error("fetch exploded"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const unhandled: unknown[] = [];
        const onUnhandled = (reason: unknown) => unhandled.push(reason);
        process.on("unhandledRejection", onUnhandled);
        s.opts.onRelayError = (_r: NDKRelay, error: Error) => {
            s.callbacks.push({ name: "onRelayError", message: error.message });
            throw new Error("consumer onRelayError exploded");
        };

        await syncAndSubscribe.call(s.ndk, s.filter, s.opts);
        await waitFor(s.done);
        await new Promise((r) => setImmediate(r));
        process.off("unhandledRejection", onUnhandled);

        expect(s.callbacks).toEqual([{ name: "onRelayError", message: "fetch exploded" }, { name: "onSyncComplete" }]);
        expect(unhandled).toEqual([]);
        expect(consoleError.mock.calls.some((c) => String(c[1]).includes("consumer onRelayError exploded"))).toBe(true);
        consoleError.mockRestore();
    });
});

describe("NDKSync.syncAndSubscribe() fallback after a failed NIP-77 negotiation", () => {
    test.each<[string, LocalRelayMode]>([
        ["relay advertises NIP-77 but answers NEG-ERR", "neg-err"],
        ["relay advertises NIP-77 but answers NOTICE", "notice"],
    ])("%s -> fetchEvents fallback in the same attempt", async (_label, mode) => {
        const s = await setup(mode, true);

        await new NDKSync(s.ndk).syncAndSubscribe(s.filter, s.opts);
        await waitFor(s.done);

        expect(s.negOpens()).toBe(1);
        expect(s.fallbackRequests()).toBe(1);
        expect(s.cachedIds()).toEqual(s.expectedIds);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
        // the recovered events reach the consumer's subscription, once each
        expect([...s.received].sort()).toEqual(s.expectedIds);
        // capability cache updated so later attempts skip Negentropy
        expect(s.cache.getRelayStatus(s.ndkRelay.url)?.metadata?.sync?.supportsNegentropy).toBe(false);
    });

    test("relay without NIP-77 in NIP-11 -> fetchEvents directly (no NEG-OPEN)", async () => {
        const s = await setup("notice", false);

        await new NDKSync(s.ndk).syncAndSubscribe(s.filter, s.opts);
        await waitFor(s.done);

        expect(s.negOpens()).toBe(0);
        expect(s.fallbackRequests()).toBe(1);
        expect(s.cachedIds()).toEqual(s.expectedIds);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
    });

    test("relay with working NIP-77 -> synced through Negentropy, no fallback, no error", async () => {
        const s = await setup("negentropy", true);

        await new NDKSync(s.ndk).syncAndSubscribe(s.filter, s.opts);
        await waitFor(s.done);

        expect(s.relay.received.some((m) => m[0] === "NEG-CLOSE")).toBe(true);
        expect(s.fallbackRequests()).toBe(0);
        expect(s.cachedIds()).toEqual(s.expectedIds);
        expect(s.callbacks).toEqual([{ name: "onRelaySynced", count: 3 }, { name: "onSyncComplete" }]);
    });

    test("NDKSync.sync(): failed negotiation falls back and returns the fetched events", async () => {
        const s = await setup("neg-err", true);
        const errors: string[] = [];

        const result = await new NDKSync(s.ndk).sync(s.filter, {
            onRelayError: (_r, e) => {
                errors.push(e.message);
            },
        });

        expect(s.fallbackRequests()).toBe(1);
        expect(result.events.map((e) => e.id).sort()).toEqual(s.expectedIds);
        // NDKSync.sync() keeps its diagnostic contract: the negotiation error is still reported
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("negentropy disabled");
    });
});
