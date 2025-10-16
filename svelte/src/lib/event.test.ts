import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFetchEvent, createFetchEvents } from "./event.svelte.js";
import { NDKSvelte } from "./ndk-svelte.svelte.js";

describe("Event Fetching", () => {
    let ndk: NDKSvelte;
    let signer: NDKPrivateKeySigner;

    beforeEach(() => {
        ndk = new NDKSvelte({
            explicitRelayUrls: ["wss://relay.test"],
        });
        signer = NDKPrivateKeySigner.generate();
    });

    describe("createFetchEvent", () => {
        it("should return undefined when callback returns undefined", () => {
            const event = createFetchEvent(ndk, () => undefined);

            expect(event).toBeDefined();
            expect(event.content).toBeUndefined();
        });

        it("should fetch event by bech32 ID", async () => {
            const testEvent = new NDKEvent(ndk);
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test note";
            await testEvent.sign(signer);

            // Mock fetchEvent to return our test event
            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            const noteId = testEvent.encode();
            const event = createFetchEvent(ndk, () => noteId);

            // Wait for the effect to run
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(ndk.fetchEvent).toHaveBeenCalledWith(noteId);
            expect(event.content).toBe("Test note");
        });

        it("should fetch event by filter", async () => {
            const testEvent = new NDKEvent(ndk);
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test note";
            testEvent.pubkey = "test-pubkey";
            await testEvent.sign(signer);

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            const filter = { kinds: [1], authors: ["test-pubkey"], limit: 1 };
            const event = createFetchEvent(ndk, () => filter);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(ndk.fetchEvent).toHaveBeenCalledWith(filter);
            expect(event.content).toBe("Test note");
        });

        it("should handle fetch errors gracefully", async () => {
            vi.spyOn(ndk, "fetchEvent").mockRejectedValue(new Error("Network error"));

            const event = createFetchEvent(ndk, () => "note1test");

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(event.content).toBeUndefined();
        });

        it("should refetch when idOrFilter changes", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "First note";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Second note";
            await event2.sign(signer);

            const fetchSpy = vi
                .spyOn(ndk, "fetchEvent")
                .mockResolvedValueOnce(event1)
                .mockResolvedValueOnce(event2);

            let eventId = $state(event1.encode());
            const event = createFetchEvent(ndk, () => eventId);

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(event.content).toBe("First note");

            // Change the event ID
            eventId = event2.encode();
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(fetchSpy).toHaveBeenCalledTimes(2);
            expect(event.content).toBe("Second note");
        });

        it("should clear event when idOrFilter becomes undefined", async () => {
            const testEvent = new NDKEvent(ndk);
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test note";
            await testEvent.sign(signer);

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            let eventId = $state<string | undefined>(testEvent.encode());
            const event = createFetchEvent(ndk, () => eventId);

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(event.content).toBe("Test note");

            // Set to undefined
            eventId = undefined;
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(event.content).toBeUndefined();
        });
    });

    describe("createFetchEvents", () => {
        it("should return empty array when callback returns undefined", () => {
            const events = createFetchEvents(ndk, () => undefined);

            expect(events).toEqual([]);
        });

        it("should fetch events by single filter", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "First note";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Second note";
            await event2.sign(signer);

            const eventSet = new Set([event1, event2]);
            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(eventSet);

            const filter = { kinds: [1], limit: 10 };
            const events = createFetchEvents(ndk, () => filter);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(ndk.fetchEvents).toHaveBeenCalledWith(filter);
            expect(events).toHaveLength(2);
            expect(events[0].content).toBe("First note");
            expect(events[1].content).toBe("Second note");
        });

        it("should fetch events by multiple filters", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "Note from author 1";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Note from author 2";
            await event2.sign(signer);

            const eventSet = new Set([event1, event2]);
            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(eventSet);

            const filters = [
                { kinds: [1], authors: ["author1"], limit: 10 },
                { kinds: [1], authors: ["author2"], limit: 10 },
            ];
            const events = createFetchEvents(ndk, () => filters);

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(ndk.fetchEvents).toHaveBeenCalledWith(filters);
            expect(events).toHaveLength(2);
        });

        it("should handle fetch errors gracefully", async () => {
            vi.spyOn(ndk, "fetchEvents").mockRejectedValue(new Error("Network error"));

            const events = createFetchEvents(ndk, () => ({ kinds: [1] }));

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(events).toEqual([]);
        });

        it("should refetch when filters change", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "First batch";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Second batch";
            await event2.sign(signer);

            const fetchSpy = vi
                .spyOn(ndk, "fetchEvents")
                .mockResolvedValueOnce(new Set([event1]))
                .mockResolvedValueOnce(new Set([event2]));

            let author = $state("author1");
            const events = createFetchEvents(ndk, () => ({
                kinds: [1],
                authors: [author],
                limit: 10,
            }));

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(events).toHaveLength(1);
            expect(events[0].content).toBe("First batch");

            // Change the filter
            author = "author2";
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(fetchSpy).toHaveBeenCalledTimes(2);
            expect(events).toHaveLength(1);
            expect(events[0].content).toBe("Second batch");
        });

        it("should clear events when filters become undefined", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "Test note";
            await event1.sign(signer);

            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(new Set([event1]));

            let filter = $state<any>({ kinds: [1] });
            const events = createFetchEvents(ndk, () => filter);

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(events).toHaveLength(1);

            // Set to undefined
            filter = undefined;
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(events).toEqual([]);
        });
    });

    describe("NDKSvelte.$fetchEvent", () => {
        it("should be accessible via ndk instance", async () => {
            const testEvent = new NDKEvent(ndk);
            testEvent.kind = NDKKind.Text;
            testEvent.content = "Test";
            await testEvent.sign(signer);

            vi.spyOn(ndk, "fetchEvent").mockResolvedValue(testEvent);

            const event = ndk.$fetchEvent(() => testEvent.encode());

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(event.content).toBe("Test");
        });
    });

    describe("NDKSvelte.$fetchEvents", () => {
        it("should be accessible via ndk instance", async () => {
            const event1 = new NDKEvent(ndk);
            event1.kind = NDKKind.Text;
            event1.content = "Test 1";
            await event1.sign(signer);

            const event2 = new NDKEvent(ndk);
            event2.kind = NDKKind.Text;
            event2.content = "Test 2";
            await event2.sign(signer);

            vi.spyOn(ndk, "fetchEvents").mockResolvedValue(new Set([event1, event2]));

            const events = ndk.$fetchEvents(() => ({ kinds: [1] }));

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(events).toHaveLength(2);
        });
    });
});
