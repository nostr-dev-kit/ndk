import { describe, expect, it, vi } from "vitest";
import { NIP66LivenessFilter } from "./nip66.js";

// Minimal mock of NDK for NIP66LivenessFilter
function mockNdk(events: Array<{ tags: string[][] }> = []) {
    return {
        fetchEvents: vi.fn().mockResolvedValue(new Set(events)),
    } as any;
}

function makeMonitorEvent(relayUrl: string) {
    return { tags: [["d", relayUrl]] };
}

describe("NIP66LivenessFilter", () => {
    it("returns input unchanged when no data has been fetched", () => {
        const ndk = mockNdk();
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
        });

        const input = new Set(["wss://relay1.com/", "wss://relay2.com/"]);
        const result = filter.filterAlive(input);
        expect(result).toEqual(input);
    });

    it("filters dead relays after successful refresh", async () => {
        const events = [
            makeMonitorEvent("wss://relay1.com"),
            makeMonitorEvent("wss://relay3.com"),
        ];
        // Need >= 100 relays to pass the minAliveThreshold
        for (let i = 0; i < 100; i++) {
            events.push(makeMonitorEvent(`wss://filler${i}.com`));
        }

        const ndk = mockNdk(events);
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
        });

        await filter.refresh();

        const result = filter.filterAlive(
            new Set(["wss://relay1.com/", "wss://relay2.com/", "wss://relay3.com/"]),
        );

        expect(result.has("wss://relay1.com/")).toBe(true);
        expect(result.has("wss://relay3.com/")).toBe(true);
        expect(result.has("wss://relay2.com/")).toBe(false);
    });

    it("passes through .onion relays even when they are not in alive set", async () => {
        const events: Array<{ tags: string[][] }> = [];
        for (let i = 0; i < 110; i++) {
            events.push(makeMonitorEvent(`wss://filler${i}.com`));
        }

        const ndk = mockNdk(events);
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
        });

        await filter.refresh();

        const result = filter.filterAlive(
            new Set(["wss://abc.onion/", "wss://filler0.com/"]),
        );
        expect(result.has("wss://abc.onion/")).toBe(true);
        expect(result.has("wss://filler0.com/")).toBe(true);
    });

    it("returns input unchanged when alive set is below minAliveThreshold", async () => {
        // Only 5 relays — below default threshold of 100
        const events = [
            makeMonitorEvent("wss://relay1.com"),
            makeMonitorEvent("wss://relay2.com"),
            makeMonitorEvent("wss://relay3.com"),
            makeMonitorEvent("wss://relay4.com"),
            makeMonitorEvent("wss://relay5.com"),
        ];

        const ndk = mockNdk(events);
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
        });

        await filter.refresh();

        const input = new Set(["wss://dead.com/"]);
        const result = filter.filterAlive(input);
        // Should pass through since data is insufficient
        expect(result).toEqual(input);
    });

    it("returns input unchanged when data is stale", async () => {
        const events: Array<{ tags: string[][] }> = [];
        for (let i = 0; i < 110; i++) {
            events.push(makeMonitorEvent(`wss://filler${i}.com`));
        }

        const ndk = mockNdk(events);
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
            maxAge: 1, // 1ms — will be stale immediately
        });

        await filter.refresh();
        // Wait for data to become stale
        await new Promise((r) => setTimeout(r, 5));

        const input = new Set(["wss://dead.com/"]);
        const result = filter.filterAlive(input);
        expect(result).toEqual(input);
    });

    it("handles refresh failure gracefully", async () => {
        const ndk = {
            fetchEvents: vi.fn().mockRejectedValue(new Error("network error")),
        } as any;

        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
        });

        // Should not throw
        await filter.refresh();

        const input = new Set(["wss://relay1.com/"]);
        const result = filter.filterAlive(input);
        expect(result).toEqual(input);
    });

    it("deduplicates concurrent refresh calls", async () => {
        const events: Array<{ tags: string[][] }> = [];
        for (let i = 0; i < 110; i++) {
            events.push(makeMonitorEvent(`wss://filler${i}.com`));
        }
        const ndk = mockNdk(events);
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
        });

        // Call refresh twice concurrently
        await Promise.all([filter.refresh(), filter.refresh()]);

        // fetchEvents should only be called once
        expect(ndk.fetchEvents).toHaveBeenCalledTimes(1);
    });

    it("skips refresh when data is still fresh", async () => {
        const events: Array<{ tags: string[][] }> = [];
        for (let i = 0; i < 110; i++) {
            events.push(makeMonitorEvent(`wss://filler${i}.com`));
        }
        const ndk = mockNdk(events);
        const filter = new NIP66LivenessFilter(ndk, {
            monitorRelays: ["wss://monitor.example.com"],
            maxAge: 60_000,
        });

        await filter.refresh();
        await filter.refresh(); // should skip

        expect(ndk.fetchEvents).toHaveBeenCalledTimes(1);
    });
});
