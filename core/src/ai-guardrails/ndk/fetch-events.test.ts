import { describe, expect, it, vi } from "vitest";
import { fetchingEvents } from "./fetch-events.js";

describe("fetchingEvents guardrail", () => {
    // Helper to create default mock functions
    const createMocks = (shouldWarn = true) => ({
        warn: vi.fn(),
        shouldWarnRatio: vi.fn(() => shouldWarn),
        incrementCount: vi.fn(),
    });

    describe("single event lookups", () => {
        it("should suggest fetchEvent() for single ID filter", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = { ids: ["abc123"] };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(warn).toHaveBeenCalled();
            expect(warn.mock.calls[0][0]).toBe("fetch-events-usage");
            const message = warn.mock.calls[0][1];
            expect(message).toContain("For fetching a single event, use fetchEvent()");
            expect(message).toContain("fetchEvent(eventId)");
            expect(message).toContain("note1...");
            expect(message).toContain("nevent1...");
        });

        it("should suggest fetchEvent() for single ID filter in array", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = [{ ids: ["abc123"] }];

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(warn).toHaveBeenCalled();
            expect(warn.mock.calls[0][0]).toBe("fetch-events-usage");
            const message = warn.mock.calls[0][1];
            expect(message).toContain("For fetching a single event, use fetchEvent()");
        });

        it("should suggest fetchEvent() for NIP-33 single event filter (decoded naddr)", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = {
                kinds: [30023],
                authors: ["pubkey123"],
                "#d": ["identifier"],
            };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
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
        it("should suggest subscribe() for multiple IDs when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters = { ids: ["abc123", "def456"] };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
            expect(warn.mock.calls[0][1]).toContain("subscribe(filter");
        });

        it("should NOT suggest subscribe() for multiple IDs when ratio threshold is not exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(false);
            const filters = { ids: ["abc123", "def456"] };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
        });

        it("should suggest subscribe() for author filter when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters = { kinds: [1], authors: ["pubkey123"] };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should suggest subscribe() for multiple filters when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters = [{ ids: ["abc123"] }, { ids: ["def456"] }];

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should suggest subscribe() for kind filter only when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters = { kinds: [1] };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });
    });

    describe("replaceable events", () => {
        it("should NOT warn for ONLY_CACHE usage", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = { kinds: [1], authors: ["pubkey123"] };
            const opts = { cacheUsage: "ONLY_CACHE" as any };

            fetchingEvents(filters, opts, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
        });

        it("should NOT warn for kind 0 (profile) with authors", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = {
                kinds: [0],
                authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
        });

        it("should NOT warn for kind 3 (contacts) with authors", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = {
                kinds: [3],
                authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
        });

        it("should NOT warn for kind 10002 (relay metadata) with authors", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks();
            const filters = {
                kinds: [10002],
                authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
        });

        it("should warn for kind 10002 WITHOUT authors when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters = {
                kinds: [10002],
            };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });
    });

    describe("edge cases", () => {
        it("should handle empty filters array when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters: any[] = [];

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should handle filter without ids or NIP-33 structure when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            const filters = { limit: 10 };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });

        it("should not treat incomplete NIP-33 filter as single event when ratio threshold is exceeded", () => {
            const { warn, shouldWarnRatio, incrementCount } = createMocks(true);
            // Missing #d identifier
            const filters = {
                kinds: [30023],
                authors: ["pubkey123"],
            };

            fetchingEvents(filters, undefined, warn, shouldWarnRatio, incrementCount);

            expect(incrementCount).toHaveBeenCalled();
            expect(shouldWarnRatio).toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(
                "fetch-events-usage",
                expect.stringContaining("In most cases, you should use subscribe()"),
                expect.any(String),
            );
        });
    });
});
