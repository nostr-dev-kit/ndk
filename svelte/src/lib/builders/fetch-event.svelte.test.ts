import { NDKEvent, NDKKind, nip19, type NDKRelay } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, generateTestEventId } from "../test-utils.js";
import { createFetchEvent } from "./fetch-event.svelte.js";

// Define the event handlers type locally since it's not exported
interface NDKSubscriptionEventHandlers {
    onEvent?: (event: NDKEvent, relay?: NDKRelay) => void;
    onEose?: () => void;
}

describe("createFetchEvent", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;
    let subscribeSpy: any;

    // Helper to create valid bech32 encoded event IDs
    const createValidNote1 = (id: string) => nip19.noteEncode(id);
    const createValidNevent = (id: string) => nip19.neventEncode({ id });
    const createValidNaddr = (identifier: string, pubkey: string, kind: number) =>
        nip19.naddrEncode({ identifier, pubkey, kind });

    // Helper to create a mock subscription that calls callbacks
    const createMockSubscription = (event?: NDKEvent | null, shouldError = false) => {
        const mockSub = { stop: vi.fn() };

        subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filter, opts, autoStartOrHandlers) => {
            // Type guard to check if it's event handlers
            const handlers = typeof autoStartOrHandlers === 'object' && !('relays' in autoStartOrHandlers)
                ? autoStartOrHandlers as NDKSubscriptionEventHandlers
                : undefined;

            if (shouldError) {
                // Don't call onEvent or onEose for errors
                handlers?.onEose?.();
            } else if (event) {
                handlers?.onEvent?.(event);
                handlers?.onEose?.();
            } else {
                // No event found
                handlers?.onEose?.();
            }
            return mockSub as any;
        });

        return mockSub;
    };

    beforeEach(() => {
        ndk = createTestNDK();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
        subscribeSpy?.mockRestore();
    });

    describe("initialization", () => {
        it("should initialize with loading=true, null event, and null error", () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const validNote = createValidNote1(generateTestEventId("test"));
            createMockSubscription(null);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            expect(fetchState!.loading).toBe(true);
            expect(fetchState!.event).toBeNull();
            expect(fetchState!.error).toBeNull();
        });

        it("should handle empty bech32 without subscribing", () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const subscribeSpy = vi.spyOn(ndk, "subscribe");

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: "" }));
            });

            // Should not call subscribe with empty bech32
            expect(subscribeSpy).not.toHaveBeenCalled();
        });
    });

    describe("successful event fetching", () => {
        it("should fetch and set event when bech32 is provided", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            testEvent.id = generateTestEventId("note1");
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test note";

            const validNote = createValidNote1(testEvent.id);
            createMockSubscription(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBe(testEvent);
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBeNull();
        });

        it("should handle note1 bech32 format", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            testEvent.id = generateTestEventId("abc123");
            testEvent.kind = NDKKind.Text;

            const validNote = createValidNote1(testEvent.id);
            createMockSubscription(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(subscribeSpy).toHaveBeenCalled();
            expect(fetchState!.event).toBe(testEvent);
        });

        it("should handle nevent1 bech32 format", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            testEvent.id = generateTestEventId("xyz789");
            const validNevent = createValidNevent(testEvent.id);

            createMockSubscription(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNevent }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(subscribeSpy).toHaveBeenCalled();
            expect(fetchState!.event).toBe(testEvent);
        });

        it("should handle naddr1 bech32 format", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            const pubkey = generateTestEventId("author");
            const validNaddr = createValidNaddr("test-identifier", pubkey, 30023);

            createMockSubscription(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNaddr }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(subscribeSpy).toHaveBeenCalled();
            expect(fetchState!.event).toBe(testEvent);
        });
    });

    describe("event not found handling", () => {
        it("should complete with null event when no event is found", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const validNote = createValidNote1(generateTestEventId("notfound"));
            createMockSubscription(null);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBeNull();
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBeNull();
        });

        it("should handle subscription with no events", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const validNote = createValidNote1(generateTestEventId("noevent"));
            createMockSubscription(null);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBeNull();
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBeNull();
        });
    });

    describe("subscription lifecycle", () => {
        it("should complete subscription even if no events arrive", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const validNote = createValidNote1(generateTestEventId("empty"));
            createMockSubscription(null);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBeNull();
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBeNull();
        });

        it("should handle subscription completion", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const validNote = createValidNote1(generateTestEventId("complete"));
            createMockSubscription(null);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: validNote }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBeNull();
        });
    });

    describe("reactive bech32 updates", () => {
        it("should fetch new event when bech32 changes", async () => {
            const event1 = new NDKEvent(ndk);
            event1.id = generateTestEventId("event1");
            event1.content = "First event";

            const event2 = new NDKEvent(ndk);
            event2.id = generateTestEventId("event2");
            event2.content = "Second event";

            const validNote1 = createValidNote1(event1.id);
            const validNote2 = createValidNote1(event2.id);

            let currentBech32 = $state(validNote1);
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            let callCount = 0;
            const mockSub = { stop: vi.fn() };

            subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filter, opts, autoStartOrHandlers) => {
                const handlers = typeof autoStartOrHandlers === 'object' && !('relays' in autoStartOrHandlers)
                    ? autoStartOrHandlers as NDKSubscriptionEventHandlers
                    : undefined;

                callCount++;
                // Use setTimeout to make callbacks async
                setTimeout(() => {
                    if (callCount === 1) {
                        handlers?.onEvent?.(event1);
                        handlers?.onEose?.();
                    } else if (callCount === 2) {
                        handlers?.onEvent?.(event2);
                        handlers?.onEose?.();
                    }
                }, 0);
                return mockSub as any;
            });

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: currentBech32 }));
            });

            await new Promise(resolve => setTimeout(resolve, 20));
            flushSync();

            expect(fetchState!.event).toBe(event1);

            // Change bech32
            currentBech32 = validNote2;
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 20));
            flushSync();

            expect(subscribeSpy).toHaveBeenCalledTimes(2);
            expect(fetchState!.event).toBe(event2);
        });

        it("should reset event when bech32 changes from null to event", async () => {
            const validEvent = new NDKEvent(ndk);
            validEvent.id = generateTestEventId("valid");

            const emptyNote = createValidNote1(generateTestEventId("empty"));
            const validNote = createValidNote1(validEvent.id);

            let currentBech32 = $state(emptyNote);
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            let callCount = 0;
            const mockSub = { stop: vi.fn() };

            subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filter, opts, autoStartOrHandlers) => {
                const handlers = typeof autoStartOrHandlers === 'object' && !('relays' in autoStartOrHandlers)
                    ? autoStartOrHandlers as NDKSubscriptionEventHandlers
                    : undefined;

                callCount++;
                if (callCount === 1) {
                    // First subscription returns no event
                    handlers?.onEose?.();
                } else if (callCount === 2) {
                    // Second subscription returns event
                    handlers?.onEvent?.(validEvent);
                    handlers?.onEose?.();
                }
                return mockSub as any;
            });

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: currentBech32 }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBeNull();

            // Change bech32 to valid one
            currentBech32 = validNote;
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.error).toBeNull();
            expect(fetchState!.event).toBe(validEvent);
        });

        it("should set loading=true when bech32 changes", async () => {
            const event1 = new NDKEvent(ndk);
            event1.id = generateTestEventId("first");

            const event2 = new NDKEvent(ndk);
            event2.id = generateTestEventId("second");

            const validNote1 = createValidNote1(event1.id);
            const validNote2 = createValidNote1(event2.id);

            let currentBech32 = $state(validNote1);
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            let callCount = 0;
            const mockSub = { stop: vi.fn() };
            let delayedCallback: (() => void) | undefined;

            subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filter, opts, autoStartOrHandlers) => {
                const handlers = typeof autoStartOrHandlers === 'object' && !('relays' in autoStartOrHandlers)
                    ? autoStartOrHandlers as NDKSubscriptionEventHandlers
                    : undefined;

                callCount++;
                if (callCount === 1) {
                    // Make first subscription async
                    setTimeout(() => {
                        handlers?.onEvent?.(event1);
                        handlers?.onEose?.();
                    }, 0);
                } else if (callCount === 2 && handlers) {
                    // Delay the callback to test loading state
                    // Capture handlers in a const to satisfy TypeScript
                    const capturedHandlers = handlers;
                    delayedCallback = () => {
                        capturedHandlers.onEvent?.(event2);
                        capturedHandlers.onEose?.();
                    };
                }
                return mockSub as any;
            });

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: currentBech32 }));
            });

            await new Promise(resolve => setTimeout(resolve, 20));
            flushSync();

            expect(fetchState!.loading).toBe(false);

            // Change bech32
            currentBech32 = validNote2;

            // Wait a tick for reactive state to update
            await new Promise(resolve => setTimeout(resolve, 5));
            flushSync();

            // Should be loading now
            expect(fetchState!.loading).toBe(true);

            // Complete the delayed subscription
            if (delayedCallback) delayedCallback();
            await new Promise(resolve => setTimeout(resolve, 20));
            flushSync();

            expect(fetchState!.loading).toBe(false);
        });

        it("should handle changing to empty bech32", async () => {
            const event1 = new NDKEvent(ndk);
            event1.id = generateTestEventId("first");

            const validNote = createValidNote1(event1.id);

            let currentBech32 = $state(validNote);
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const mockSub = { stop: vi.fn() };

            subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation((filter, opts, autoStartOrHandlers) => {
                const handlers = typeof autoStartOrHandlers === 'object' && !('relays' in autoStartOrHandlers)
                    ? autoStartOrHandlers as NDKSubscriptionEventHandlers
                    : undefined;

                handlers?.onEvent?.(event1);
                handlers?.onEose?.();
                return mockSub as any;
            });

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(ndk, () => ({ bech32: currentBech32 }));
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBe(event1);
            const callCount = subscribeSpy.mock.calls.length;

            // Change to empty bech32
            currentBech32 = "";
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            // Should not subscribe again
            expect(subscribeSpy.mock.calls.length).toBe(callCount);
        });
    });
});
