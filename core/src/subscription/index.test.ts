import { describe, expect, it, vi } from "vitest"; // Added describe, it, expect
import { NDKEvent } from "../events";
import { NDK } from "../ndk";
import { NDKSubscription } from ".";

const ndk = new NDK();
const invalidEvent = new NDKEvent(ndk, {
    kind: 1,
    created_at: 1234567890,
    pubkey: "invalid_pubkey", // This is invalid based on the Pubkey regex
    id: "id",
    sig: "signature", // This signature won't verify either
    tags: [],
    content: "",
});

describe("NDKSubscriptionFilters", () => {
    describe("validation", () => {
        it("doesn't emit for invalid/unverified events", () => {
            const sub = new NDKSubscription(ndk, {}, {});
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = vi.spyOn(sub, "emit" as any);
            const mockedValidate = vi.spyOn(invalidEvent, "validate");
            const mockedVerify = vi.spyOn(invalidEvent, "verifySignature");
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedValidate).toHaveBeenCalled();
            expect(mockedVerify).not.toHaveBeenCalled();
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
            mockedValidate.mockRestore();
            mockedVerify.mockRestore();
        });

        it("doesn't emit for invalid events", () => {
            // New sub skipping verification on purpose
            const sub = new NDKSubscription(ndk, {}, { skipVerification: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = vi.spyOn(sub, "emit" as any);
            const mockedValidate = vi.spyOn(invalidEvent, "validate");
            const mockedVerify = vi.spyOn(invalidEvent, "verifySignature");
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedValidate).toHaveBeenCalled();
            expect(mockedVerify).not.toHaveBeenCalled();
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
            mockedValidate.mockRestore();
            mockedVerify.mockRestore();
        });

        it("doesn't emit events when isValid returns false", () => {
            const sub = new NDKSubscription(ndk, {}, { skipVerification: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = vi.spyOn(sub, "emit" as any);

            // Create a new event with a mock isValid property
            const event = new NDKEvent(ndk);

            // Mock the isValid getter to return false
            Object.defineProperty(event, "isValid", {
                get: () => false,
            });

            sub.eventReceived(event, undefined);

            // Event should not be emitted
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("doesn't emit for events with bad signatures", () => {
            // New sub skipping validation on purpose
            const sub = new NDKSubscription(ndk, {}, { skipValidation: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = vi.spyOn(sub, "emit" as any);
            const mockedValidate = vi.spyOn(invalidEvent, "validate");
            // Mock verifySignature to explicitly return false
            const mockedVerify = vi.spyOn(invalidEvent, "verifySignature").mockImplementation(() => false);

            // Create a mock relay object with the required methods
            const mockRelay = {
                shouldValidateEvent: () => true,
                addValidatedEvent: vi.fn(),
                addNonValidatedEvent: vi.fn(),
                url: "wss://mock.relay",
            };

            // Pass the mock relay to eventReceived
            sub.eventReceived(invalidEvent, mockRelay as any);

            expect(mockedValidate).not.toHaveBeenCalled();
            expect(mockedVerify).toHaveBeenCalled();
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
            mockedValidate.mockRestore();
            mockedVerify.mockRestore();
        });

        it("does not skip invalid events when validation and verification is disabled", () => {
            const sub = new NDKSubscription(ndk, {}, { skipValidation: true, skipVerification: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = vi.spyOn(sub, "emit" as any);
            const mockedValidate = vi.spyOn(invalidEvent, "validate");
            const mockedVerify = vi.spyOn(invalidEvent, "verifySignature");
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedValidate).not.toHaveBeenCalled();
            expect(mockedVerify).not.toHaveBeenCalled();
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
            mockedValidate.mockRestore();
            mockedVerify.mockRestore();
        });
    });
});
