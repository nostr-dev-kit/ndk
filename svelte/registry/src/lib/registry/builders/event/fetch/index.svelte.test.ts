import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, generateTestEventId } from "../../../../../test-utils";
import { createFetchEvent } from "./index.svelte";

describe("createFetchEvent", () => {
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
        it("should initialize with loading=true, null event, and null error", () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const fetchSpy = vi.spyOn(ndk, "fetchEvent").mockResolvedValue(null as any);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "note1test" }), ndk);
            });

            expect(fetchState!.loading).toBe(true);
            expect(fetchState!.event).toBeNull();
            expect(fetchState!.error).toBeNull();
        });

        it("should handle empty bech32 without fetching", () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const fetchSpy = vi.spyOn(ndk, "fetchEvent").mockResolvedValue(null as any);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "" }), ndk);
            });

            // Should not call fetchEvent with empty bech32
            expect(fetchSpy).not.toHaveBeenCalled();
        });
    });

    describe("successful event fetching", () => {
        it("should fetch and set event when bech32 is provided", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            testEvent.id = generateTestEventId("note1");
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test note";

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "note1test123" }), ndk);
            });

            // Wait for async fetch to complete
            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBe(testEvent);
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBeNull();
        });

        it("should handle note1 bech32 format", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            testEvent.kind = NDKKind.Text;

            const fetchSpy = vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "note1abc123" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchSpy).toHaveBeenCalledWith("note1abc123");
            expect(fetchState!.event).toBe(testEvent);
        });

        it("should handle nevent1 bech32 format", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            const fetchSpy = vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "nevent1xyz789" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchSpy).toHaveBeenCalledWith("nevent1xyz789");
            expect(fetchState!.event).toBe(testEvent);
        });

        it("should handle naddr1 bech32 format", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const testEvent = new NDKEvent(ndk);
            const fetchSpy = vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "naddr1qwerty" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchSpy).toHaveBeenCalledWith("naddr1qwerty");
            expect(fetchState!.event).toBe(testEvent);
        });
    });

    describe("event not found handling", () => {
        it("should set error when fetchEvent returns null", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(null as any);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "note1notfound" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBeNull();
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBe("Event not found");
        });

        it("should set error when fetchEvent returns undefined", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(undefined as any);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "note1undefined" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.error).toBe("Event not found");
            expect(fetchState!.loading).toBe(false);
        });
    });

    describe("error handling", () => {
        it("should handle fetch errors gracefully", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(ndk, "fetchEvent").mockRejectedValue(new Error("Network error"));

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "note1error" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBeNull();
            expect(fetchState!.loading).toBe(false);
            expect(fetchState!.error).toBe("Failed to load event");
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it("should handle invalid bech32 format errors", async () => {
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(ndk, "fetchEvent").mockRejectedValue(new Error("Invalid bech32"));

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: "invalid-bech32" }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.error).toBe("Failed to load event");
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe("reactive bech32 updates", () => {
        it("should fetch new event when bech32 changes", async () => {
            let currentBech32 = $state("note1first");
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const event1 = new NDKEvent(ndk);
            event1.id = generateTestEventId("event1");
            event1.content = "First event";

            const event2 = new NDKEvent(ndk);
            event2.id = generateTestEventId("event2");
            event2.content = "Second event";

            const fetchSpy = vi.spyOn(ndk, "fetchEvent")
                .mockResolvedValueOnce(event1)
                .mockResolvedValueOnce(event2);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: currentBech32 }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBe(event1);

            // Change bech32
            currentBech32 = "note1second";
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchSpy).toHaveBeenCalledTimes(2);
            expect(fetchState!.event).toBe(event2);
        });

        it("should reset error state when bech32 changes", async () => {
            let currentBech32 = $state("note1error");
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const validEvent = new NDKEvent(ndk);

            const fetchSpy = vi.spyOn(ndk, "fetchEvent")
                .mockRejectedValueOnce(new Error("First error"))
                .mockResolvedValueOnce(validEvent);

            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: currentBech32 }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.error).toBe("Failed to load event");

            // Change bech32 to valid one
            currentBech32 = "note1valid";
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.error).toBeNull();
            expect(fetchState!.event).toBe(validEvent);

            consoleErrorSpy.mockRestore();
        });

        it("should set loading=true when bech32 changes", async () => {
            let currentBech32 = $state("note1first");
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const event1 = new NDKEvent(ndk);
            const event2 = new NDKEvent(ndk);

            vi.spyOn(ndk, "fetchEvent")
                .mockResolvedValueOnce(event1)
                .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(event2), 50)));

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: currentBech32 }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.loading).toBe(false);

            // Change bech32
            currentBech32 = "note1second";
            flushSync();

            // Should be loading immediately
            expect(fetchState!.loading).toBe(true);

            await new Promise(resolve => setTimeout(resolve, 60));
            flushSync();

            expect(fetchState!.loading).toBe(false);
        });

        it("should handle changing to empty bech32", async () => {
            let currentBech32 = $state("note1first");
            let fetchState: ReturnType<typeof createFetchEvent> | undefined;

            const event1 = new NDKEvent(ndk);
            const fetchSpy = vi.spyOn(ndk, "fetchEvent").mockResolvedValue(event1);

            cleanup = $effect.root(() => {
                fetchState = createFetchEvent(() => ({ bech32: currentBech32 }), ndk);
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            expect(fetchState!.event).toBe(event1);
            const callCount = fetchSpy.mock.calls.length;

            // Change to empty bech32
            currentBech32 = "";
            flushSync();

            await new Promise(resolve => setTimeout(resolve, 10));
            flushSync();

            // Should not fetch again
            expect(fetchSpy.mock.calls.length).toBe(callCount);
        });
    });
});
