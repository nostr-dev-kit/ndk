import { describe, expect, it, vi, beforeEach } from "vitest";
import { NDKEvent } from "../events";
import { NDK } from "../ndk";
import { NDKSubscription } from ".";

describe("futureTimestampGrace", () => {
    let ndk: NDK;

    beforeEach(() => {
        vi.useFakeTimers();
        // Set fake time to a known timestamp (2024-01-01 00:00:00 UTC = 1704067200)
        vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    });

    describe("when futureTimestampGrace is not set", () => {
        beforeEach(() => {
            ndk = new NDK();
        });

        it("accepts events with future timestamps", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event 1 hour in the future
            const futureEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 3600,
                pubkey: "a".repeat(64),
                id: "id",
                sig: "sig",
                tags: [],
                content: "future event",
            });

            sub.eventReceived(futureEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });
    });

    describe("when futureTimestampGrace is set", () => {
        beforeEach(() => {
            // Set grace period to 5 minutes (300 seconds)
            ndk = new NDK({ futureTimestampGrace: 300 });
        });

        it("accepts events within grace period", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event 4 minutes in the future (within grace period)
            const acceptableEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 240,
                pubkey: "a".repeat(64),
                id: "id1",
                sig: "sig",
                tags: [],
                content: "acceptable future event",
            });

            sub.eventReceived(acceptableEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("accepts events at exact grace period boundary", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event exactly at grace period (5 minutes)
            const boundaryEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 300,
                pubkey: "a".repeat(64),
                id: "id2",
                sig: "sig",
                tags: [],
                content: "boundary event",
            });

            sub.eventReceived(boundaryEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("discards events beyond grace period", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event 10 minutes in the future (beyond grace period)
            const tooFarFutureEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 600,
                pubkey: "a".repeat(64),
                id: "id3",
                sig: "sig",
                tags: [],
                content: "too far future event",
            });

            sub.eventReceived(tooFarFutureEvent, undefined);
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("accepts events with current or past timestamps", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event in the past
            const pastEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) - 3600,
                pubkey: "a".repeat(64),
                id: "id4",
                sig: "sig",
                tags: [],
                content: "past event",
            });

            sub.eventReceived(pastEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("accepts events with current timestamp", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event at current time
            const currentEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                pubkey: "a".repeat(64),
                id: "id5",
                sig: "sig",
                tags: [],
                content: "current event",
            });

            sub.eventReceived(currentEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("logs debug message when discarding events", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedDebug = vi.spyOn(sub, "debug" as any);

            // Event 1 hour in the future
            const tooFarFutureEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 3600,
                pubkey: "a".repeat(64),
                id: "id6",
                sig: "sig",
                tags: [],
                content: "logged discard event",
            });

            sub.eventReceived(tooFarFutureEvent, undefined);
            expect(mockedDebug).toHaveBeenCalledWith(
                expect.stringContaining("Event discarded"),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
            mockedDebug.mockRestore();
        });

        it("handles events without created_at", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event without created_at
            const noTimestampEvent = new NDKEvent(ndk, {
                kind: 1,
                pubkey: "a".repeat(64),
                id: "id7",
                sig: "sig",
                tags: [],
                content: "no timestamp event",
            } as any);

            sub.eventReceived(noTimestampEvent, undefined);
            // Should be accepted (no timestamp check)
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });
    });

    describe("with different grace periods", () => {
        it("works with 0 grace period (no future events allowed)", () => {
            ndk = new NDK({ futureTimestampGrace: 0 });
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event 1 second in the future
            const futureEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 1,
                pubkey: "a".repeat(64),
                id: "id8",
                sig: "sig",
                tags: [],
                content: "1 second future",
            });

            sub.eventReceived(futureEvent, undefined);
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("works with large grace period", () => {
            ndk = new NDK({ futureTimestampGrace: 86400 }); // 24 hours
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true },
            );
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Event 12 hours in the future
            const futureEvent = new NDKEvent(ndk, {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000) + 43200,
                pubkey: "a".repeat(64),
                id: "id9",
                sig: "sig",
                tags: [],
                content: "12 hours future",
            });

            sub.eventReceived(futureEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });
    });
});
