import { describe, expect, it, vi } from "vitest";
import { fetchingEvents } from "./fetch-events.js";

describe("fetchingEvents guardrail", () => {
    describe("single event lookups", () => {
        it("should suggest fetchEvent() for single ID filter", () => {
            const warn = vi.fn();
            const filters = { ids: ["abc123"] };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalled();
            expect(warn.mock.calls[0][0]).toBe("fetch-events-usage");
            const message = warn.mock.calls[0][1];
            expect(message).toContain("For fetching a single event, use fetchEvent()");
            expect(message).toContain("fetchEvent(eventId)");
            expect(message).toContain("note1...");
            expect(message).toContain("nevent1...");
        });

        it("should suggest fetchEvent() for single ID filter in array", () => {
            const warn = vi.fn();
            const filters = [{ ids: ["abc123"] }];

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalled();
            expect(warn.mock.calls[0][0]).toBe("fetch-events-usage");
            const message = warn.mock.calls[0][1];
            expect(message).toContain("For fetching a single event, use fetchEvent()");
        });

        it("should suggest fetchEvent() for NIP-33 single event filter (decoded naddr)", () => {
            const warn = vi.fn();
            const filters = {
                kinds: [30023],
                authors: ["pubkey123"],
                "#d": ["identifier"],
            };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalled();
            expect(warn.mock.calls[0][0]).toBe("fetch-events-usage");
            const message = warn.mock.calls[0][1];
            expect(message).toContain("For fetching a NIP-33 addressable event");
            expect(message).toContain("naddr directly");
            expect(message).toContain("nip19.decode(naddr)");
            expect(message).toContain("fetchEvent(naddr)");
            expect(message).toContain("fetchEvent() handles naddr decoding automatically");
        });
    });

    describe("multiple event lookups", () => {
        it("should suggest subscribe() for multiple IDs", () => {
            const warn = vi.fn();
            const filters = { ids: ["abc123", "def456"] };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
            expect(warn.mock.calls[0][1]).toContain("subscribe(filter");
        });

        it("should suggest subscribe() for author filter", () => {
            const warn = vi.fn();
            const filters = { kinds: [1], authors: ["pubkey123"] };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should suggest subscribe() for multiple filters", () => {
            const warn = vi.fn();
            const filters = [{ ids: ["abc123"] }, { ids: ["def456"] }];

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should suggest subscribe() for kind filter only", () => {
            const warn = vi.fn();
            const filters = { kinds: [1] };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });
    });

    describe("edge cases", () => {
        it("should handle empty filters array", () => {
            const warn = vi.fn();
            const filters: any[] = [];

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should handle filter without ids or NIP-33 structure", () => {
            const warn = vi.fn();
            const filters = { limit: 10 };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should not treat incomplete NIP-33 filter as single event", () => {
            const warn = vi.fn();
            // Missing #d identifier
            const filters = {
                kinds: [30023],
                authors: ["pubkey123"],
            };

            fetchingEvents(filters, warn);

            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });
    });
});
