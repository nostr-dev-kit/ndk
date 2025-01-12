import { NDKSubscription } from ".";
import { NDK } from "../ndk";
import { NDKEvent } from "../events";

const ndk = new NDK();
const invalidEvent = new NDKEvent(ndk, {
    kind: 1,
    created_at: 1234567890,
    pubkey: "pubkey", // This is invalid based on the Pubkey regex
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
            const mockedEmit = jest.spyOn(sub, "emit" as any);
            const mockedValidate = jest.spyOn(invalidEvent, "validate");
            const mockedVerify = jest.spyOn(invalidEvent, "verifySignature");
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
            const mockedEmit = jest.spyOn(sub, "emit" as any);
            const mockedValidate = jest.spyOn(invalidEvent, "validate");
            const mockedVerify = jest.spyOn(invalidEvent, "verifySignature");
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedValidate).toHaveBeenCalled();
            expect(mockedVerify).not.toHaveBeenCalled();
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
            mockedValidate.mockRestore();
            mockedVerify.mockRestore();
        });

        it("doesn't emit for events with bad signatures", () => {
            // New sub skipping validation on purpose
            const sub = new NDKSubscription(ndk, {}, { skipValidation: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = jest.spyOn(sub, "emit" as any);
            const mockedValidate = jest.spyOn(invalidEvent, "validate");
            const mockedVerify = jest.spyOn(invalidEvent, "verifySignature");
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedValidate).not.toHaveBeenCalled();
            expect(mockedVerify).toHaveBeenCalled();
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
            mockedValidate.mockRestore();
            mockedVerify.mockRestore();
        });

        it("does not skip invalid events when validation and verification is disabled", () => {
            const sub = new NDKSubscription(
                ndk,
                {},
                { skipValidation: true, skipVerification: true }
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedEmit = jest.spyOn(sub, "emit" as any);
            const mockedValidate = jest.spyOn(invalidEvent, "validate");
            const mockedVerify = jest.spyOn(invalidEvent, "verifySignature");
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
