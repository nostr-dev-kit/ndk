import { NDKSubscription } from "./index.js";
import { NDKSubscriptionTier } from "../events/kinds/subscriptions/tier.js";
import { NDK } from "../ndk/index.js";

const ndk = new NDK();
const invalidEvent = new NDKSubscriptionTier(ndk);

describe("NDKSubscriptionFilters", () => {
    describe("validation", () => {
        it("skips invalid events", () => {
            const sub = new NDKSubscription(ndk, {});
            const mockedEmit = jest.spyOn(sub, "emit" as any);
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedEmit).not.toHaveBeenCalled();
            mockedEmit.mockRestore();
        });

        it("does not skip valid events when validation is disabled", () => {
            const sub = new NDKSubscription(ndk, {}, { skipValidation: true });
            const mockedEmit = jest.spyOn(sub, "emit" as any);
            sub.eventReceived(invalidEvent, undefined);
            expect(mockedEmit).toHaveBeenCalled();
            mockedEmit.mockRestore();
        });
    });
});
