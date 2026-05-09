import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDKEvent } from "../events";
import { NDKKind } from "../events/kinds/index";
import { verifiedSignatures } from "../events/validation";
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

describe("Kind:0 profile signature enforcement", () => {
    const validPubkey = "a".repeat(64);

    function makeProfileEvent(testNdk: NDK): NDKEvent {
        return new NDKEvent(testNdk, {
            kind: NDKKind.Metadata,
            created_at: Math.floor(Date.now() / 1000),
            pubkey: validPubkey,
            id: Math.random().toString(36).substring(2),
            sig: "b".repeat(128),
            tags: [],
            content: '{"name":"test"}',
        });
    }

    function mockRelay() {
        return {
            shouldValidateEvent: () => true,
            addValidatedEvent: vi.fn(),
            addNonValidatedEvent: vi.fn(),
            url: "wss://mock.relay",
        };
    }

    beforeEach(() => {
        verifiedSignatures.clear();
    });

    it("drops kind:0 events with invalid signatures via relay", () => {
        const testNdk = new NDK();
        const sub = new NDKSubscription(testNdk, { kinds: [0] }, { skipValidation: true });
        const event = makeProfileEvent(testNdk);
        const relay = mockRelay();

        const mockedVerify = vi.spyOn(event, "verifySignature").mockReturnValue(false);
        const mockedEmit = vi.spyOn(sub, "emit" as any);

        sub.eventReceived(event, relay as any);

        expect(mockedVerify).toHaveBeenCalled();
        expect(mockedEmit).not.toHaveBeenCalled();
        mockedVerify.mockRestore();
        mockedEmit.mockRestore();
    });

    it("emits kind:0 events with valid signatures via relay", () => {
        const testNdk = new NDK();
        const sub = new NDKSubscription(testNdk, { kinds: [0] }, { skipValidation: true });
        const event = makeProfileEvent(testNdk);
        const relay = mockRelay();

        const mockedVerify = vi.spyOn(event, "verifySignature").mockReturnValue(true);
        const mockedEmit = vi.spyOn(sub, "emit" as any);

        sub.eventReceived(event, relay as any);

        expect(mockedVerify).toHaveBeenCalled();
        expect(mockedEmit).toHaveBeenCalled();
        mockedVerify.mockRestore();
        mockedEmit.mockRestore();
    });

    it("uses forceSync=true for kind:0 even when asyncSigVerification is enabled", () => {
        const testNdk = new NDK();
        testNdk.asyncSigVerification = true;
        const sub = new NDKSubscription(testNdk, { kinds: [0] }, { skipValidation: true });
        const event = makeProfileEvent(testNdk);
        const relay = mockRelay();

        const mockedVerify = vi.spyOn(event, "verifySignature").mockReturnValue(true);

        sub.eventReceived(event, relay as any);

        // Should be called with (true, true) — persist=true, forceSync=true
        expect(mockedVerify).toHaveBeenCalledWith(true, true);
        mockedVerify.mockRestore();
    });

    it("drops kind:0 events with invalid signatures without relay", () => {
        const testNdk = new NDK();
        const sub = new NDKSubscription(testNdk, { kinds: [0] }, { skipValidation: true });
        const event = makeProfileEvent(testNdk);

        const mockedVerify = vi.spyOn(event, "verifySignature").mockReturnValue(false);
        const mockedEmit = vi.spyOn(sub, "emit" as any);

        // No relay passed
        sub.eventReceived(event, undefined);

        expect(mockedVerify).toHaveBeenCalledWith(true, true);
        expect(mockedEmit).not.toHaveBeenCalled();
        mockedVerify.mockRestore();
        mockedEmit.mockRestore();
    });

    it("emits kind:0 events with valid signatures without relay", () => {
        const testNdk = new NDK();
        const sub = new NDKSubscription(testNdk, { kinds: [0] }, { skipValidation: true });
        const event = makeProfileEvent(testNdk);

        const mockedVerify = vi.spyOn(event, "verifySignature").mockReturnValue(true);
        const mockedEmit = vi.spyOn(sub, "emit" as any);

        sub.eventReceived(event, undefined);

        expect(mockedVerify).toHaveBeenCalled();
        expect(mockedEmit).toHaveBeenCalled();
        mockedVerify.mockRestore();
        mockedEmit.mockRestore();
    });

    it("does not force-verify non-kind:0 events without relay", () => {
        const testNdk = new NDK();
        const sub = new NDKSubscription(testNdk, { kinds: [1] }, { skipValidation: true });
        const event = new NDKEvent(testNdk, {
            kind: NDKKind.Text,
            created_at: Math.floor(Date.now() / 1000),
            pubkey: validPubkey,
            id: Math.random().toString(36).substring(2),
            sig: "b".repeat(128),
            tags: [],
            content: "hello",
        });

        const mockedVerify = vi.spyOn(event, "verifySignature");
        const mockedEmit = vi.spyOn(sub, "emit" as any);

        // kind:1 without relay — should NOT trigger verification
        sub.eventReceived(event, undefined);

        expect(mockedVerify).not.toHaveBeenCalled();
        expect(mockedEmit).toHaveBeenCalled();
        mockedVerify.mockRestore();
        mockedEmit.mockRestore();
    });
});
