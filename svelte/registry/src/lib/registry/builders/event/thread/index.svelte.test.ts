import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK } from "../../../../../test-utils";
import { createThreadView } from "./index.svelte";

describe("createThreadView", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        ndk = createTestNDK();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with an event object", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "event-id-123";
            event.kind = NDKKind.Text;
            event.pubkey = "a".repeat(64);
            event.content = "Main event content";
            event.tags = [];

            // Mock subscribe to prevent actual subscriptions
            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(thread).toBeDefined();
            expect(thread!.focusedEventId).toBe("event-id-123");
        });

        it("should initialize with focused event in events array", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "event-id-456";
            event.kind = NDKKind.Text;
            event.pubkey = "b".repeat(64);
            event.content = "Another event";
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            // Events should contain at least the focused event
            expect(thread!.events.length).toBeGreaterThanOrEqual(1);
            expect(thread!.events.some(node => node.id === "event-id-456")).toBe(true);
            expect(thread!.replies).toEqual([]);
            expect(thread!.otherReplies).toEqual([]);
            expect(thread!.allReplies).toEqual([]);
        });

        it("should handle maxDepth configuration", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "event-id-789";
            event.kind = NDKKind.Text;
            event.pubkey = "c".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(
                    () => ({ focusedEvent: event, maxDepth: 10 }),
                    ndk
                );
            });

            flushSync();

            expect(thread).toBeDefined();
        });

        it("should handle custom kinds configuration", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "event-id-abc";
            event.kind = NDKKind.Text;
            event.pubkey = "d".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(
                    () => ({ focusedEvent: event, kinds: [1, 6, 9802] }),
                    ndk
                );
            });

            flushSync();

            expect(thread).toBeDefined();
        });
    });

    describe("reactive getters", () => {
        it("should provide read-only events getter", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "test-event";
            event.kind = NDKKind.Text;
            event.pubkey = "e".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(typeof Object.getOwnPropertyDescriptor(thread!, 'events')?.get).toBe('function');
            expect(Array.isArray(thread!.events)).toBe(true);
        });

        it("should provide read-only replies getter", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "test-event-2";
            event.kind = NDKKind.Text;
            event.pubkey = "f".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(typeof Object.getOwnPropertyDescriptor(thread!, 'replies')?.get).toBe('function');
            expect(Array.isArray(thread!.replies)).toBe(true);
        });

        it("should provide read-only otherReplies getter", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "test-event-3";
            event.kind = NDKKind.Text;
            event.pubkey = "g".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(typeof Object.getOwnPropertyDescriptor(thread!, 'otherReplies')?.get).toBe('function');
            expect(Array.isArray(thread!.otherReplies)).toBe(true);
        });

        it("should provide computed allReplies getter", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "test-event-4";
            event.kind = NDKKind.Text;
            event.pubkey = "h".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(typeof Object.getOwnPropertyDescriptor(thread!, 'allReplies')?.get).toBe('function');
            expect(Array.isArray(thread!.allReplies)).toBe(true);
            // allReplies should be the concatenation of replies and otherReplies
            expect(thread!.allReplies).toEqual([...thread!.replies, ...thread!.otherReplies]);
        });

        it("should provide read-only focusedEventId getter", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "focused-123";
            event.kind = NDKKind.Text;
            event.pubkey = "i".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(typeof Object.getOwnPropertyDescriptor(thread!, 'focusedEventId')?.get).toBe('function');
            expect(thread!.focusedEventId).toBe("focused-123");
        });
    });

    describe("focusOn method", () => {
        it("should provide focusOn method", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "initial-event";
            event.kind = NDKKind.Text;
            event.pubkey = "j".repeat(64);
            event.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            expect(typeof thread!.focusOn).toBe('function');
        });

        it("should accept event object in focusOn", async () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const initialEvent = new NDKEvent(ndk);
            initialEvent.id = "initial";
            initialEvent.kind = NDKKind.Text;
            initialEvent.pubkey = "k".repeat(64);
            initialEvent.tags = [];

            const newEvent = new NDKEvent(ndk);
            newEvent.id = "new-focus";
            newEvent.kind = NDKKind.Text;
            newEvent.pubkey = "l".repeat(64);
            newEvent.tags = [["e", "initial"]]; // Reply to initial

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: initialEvent }), ndk);
            });

            flushSync();

            // Should not throw
            await expect(thread!.focusOn(newEvent)).resolves.toBeUndefined();
        });

        it("should accept event ID string in focusOn", async () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const initialEvent = new NDKEvent(ndk);
            initialEvent.id = "initial-2";
            initialEvent.kind = NDKKind.Text;
            initialEvent.pubkey = "m".repeat(64);
            initialEvent.tags = [];

            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(null);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: initialEvent }), ndk);
            });

            flushSync();

            // Should not throw even when event not found
            await expect(thread!.focusOn("non-existent-id")).resolves.toBeUndefined();
        });
    });

    describe("subscription management", () => {
        it("should create subscription on initialization", () => {
            let thread: ReturnType<typeof createThreadView> | undefined;

            const event = new NDKEvent(ndk);
            event.id = "sub-test";
            event.kind = NDKKind.Text;
            event.pubkey = "n".repeat(64);
            event.tags = [];

            const subscribeSpy = vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: vi.fn()
            } as any);

            cleanup = $effect.root(() => {
                thread = createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            // Should have called subscribe
            expect(subscribeSpy).toHaveBeenCalled();
        });

        it("should clean up subscriptions on unmount", () => {
            const event = new NDKEvent(ndk);
            event.id = "cleanup-test";
            event.kind = NDKKind.Text;
            event.pubkey = "o".repeat(64);
            event.tags = [];

            const stopMock = vi.fn();
            vi.spyOn(ndk, "subscribe").mockReturnValue({
                on: vi.fn(),
                stop: stopMock
            } as any);

            cleanup = $effect.root(() => {
                createThreadView(() => ({ focusedEvent: event }), ndk);
            });

            flushSync();

            // Trigger cleanup
            cleanup!();
            cleanup = undefined;

            // Should have called stop on subscription
            expect(stopMock).toHaveBeenCalled();
        });
    });
});
