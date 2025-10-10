import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscribeStore } from "../store";
import { useSubscribe } from "./subscribe";

// Mock NDK and related modules
vi.mock("@nostr-dev-kit/ndk", () => ({
    matchFilter: vi.fn((filter: NDKFilter, event: unknown) => {
        // Simple mock implementation for testing
        const eventObj = event as { kind?: number; pubkey?: string };
        if (filter.kinds && eventObj.kind !== undefined) {
            return filter.kinds.includes(eventObj.kind);
        }
        if (filter.authors && eventObj.pubkey) {
            return filter.authors.includes(eventObj.pubkey);
        }
        return true;
    }),
}));

vi.mock("../../ndk/hooks", () => ({
    useNDK: () => ({
        ndk: {
            subscribe: vi.fn(() => ({
                stop: vi.fn(),
            })),
        },
    }),
}));

vi.mock("../../mutes/hooks/use-mute-filter", () => ({
    useMuteFilter: () => () => false,
}));

vi.mock("react", async () => {
    const actual = await vi.importActual("react");
    return {
        ...actual,
        useEffect: vi.fn((fn, deps) => fn()),
        useRef: vi.fn(() => ({ current: null })),
    };
});

vi.mock("zustand", () => ({
    useStore: vi.fn((store, selector) => selector(store.getState())),
}));

describe("useSubscribe", () => {
    let mockStore: ReturnType<typeof createSubscribeStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockStore = createSubscribeStore(false);
    });

    describe("filterExistingEvents", () => {
        it("should filter events based on NDK filters", () => {
            const store = createSubscribeStore(false);
            const state = store.getState();

            // Add some test events
            const event1 = {
                kind: 1,
                pubkey: "alice",
                tagId: () => "event1",
                rawEvent: () => ({ kind: 1, pubkey: "alice" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            const event2 = {
                kind: 2,
                pubkey: "bob",
                tagId: () => "event2",
                rawEvent: () => ({ kind: 2, pubkey: "bob" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            const event3 = {
                kind: 1,
                pubkey: "charlie",
                tagId: () => "event3",
                rawEvent: () => ({ kind: 1, pubkey: "charlie" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            // Add events to store
            state.addEvent(event1);
            state.addEvent(event2);
            state.addEvent(event3);

            // Verify all events are in store
            expect(state.events).toHaveLength(3);

            // Filter by kind 1 only
            const filters: NDKFilter[] = [{ kinds: [1] }];
            state.filterExistingEvents(filters);

            // Should only have events with kind 1
            expect(state.events).toHaveLength(2);
            expect(state.events.every((e) => e.kind === 1)).toBe(true);
        });

        it("should keep events that match any of multiple filters", () => {
            const store = createSubscribeStore(false);
            const state = store.getState();

            const event1 = {
                kind: 1,
                pubkey: "alice",
                tagId: () => "event1",
                rawEvent: () => ({ kind: 1, pubkey: "alice" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            const event2 = {
                kind: 2,
                pubkey: "alice",
                tagId: () => "event2",
                rawEvent: () => ({ kind: 2, pubkey: "alice" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            const event3 = {
                kind: 3,
                pubkey: "bob",
                tagId: () => "event3",
                rawEvent: () => ({ kind: 3, pubkey: "bob" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            state.addEvent(event1);
            state.addEvent(event2);
            state.addEvent(event3);

            // Filter by kind 1 OR author alice
            const filters: NDKFilter[] = [{ kinds: [1] }, { authors: ["alice"] }];
            state.filterExistingEvents(filters);

            // Should have event1 (kind 1) and event2 (author alice)
            expect(state.events).toHaveLength(2);
            expect(state.events.some((e) => e.tagId() === "event1")).toBe(true);
            expect(state.events.some((e) => e.tagId() === "event2")).toBe(true);
            expect(state.events.some((e) => e.tagId() === "event3")).toBe(false);
        });

        it("should remove all events when no filters match", () => {
            const store = createSubscribeStore(false);
            const state = store.getState();

            const event1 = {
                kind: 1,
                pubkey: "alice",
                tagId: () => "event1",
                rawEvent: () => ({ kind: 1, pubkey: "alice" }),
                hasTag: () => false,
                once: vi.fn(),
            } as unknown as NDKEvent;

            state.addEvent(event1);
            expect(state.events).toHaveLength(1);

            // Filter by kind that doesn't exist
            const filters: NDKFilter[] = [{ kinds: [999] } as unknown as NDKFilter];
            state.filterExistingEvents(filters);

            expect(state.events).toHaveLength(0);
        });
    });
});
