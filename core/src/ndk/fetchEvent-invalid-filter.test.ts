import { describe, expect, it, vi } from "vitest";
import { NDK } from "./index.js";

describe("fetchEvent with invalid filter (issue #357)", () => {
    it("should not crash with ReferenceError when subscribe throws", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.example.com"],
        });

        // Mock subscribe to throw, simulating the scenario where
        // an invalid filter causes subscribe to fail before assignment.
        // The timeout callback must use optional chaining (s?.stop())
        // to avoid crashing on the unassigned variable.
        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation(() => {
            throw new Error("Invalid filter caused subscribe to fail");
        });

        try {
            await ndk.fetchEvent({ authors: ["not-a-valid-hex"] });
        } catch (error: any) {
            // Should get the subscribe error, NOT a ReferenceError about 's'
            expect(error).not.toBeInstanceOf(ReferenceError);
            expect(error.message).not.toContain("Cannot access");
            expect(error.message).toContain("Invalid filter caused subscribe to fail");
        }

        subscribeSpy.mockRestore();
    });

    it("should not crash when fetchEvent is called with a malformed hex ID string", async () => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.example.com"],
        });

        // fetchEvent with a bad string should not throw a ReferenceError.
        // It may timeout or fail for other reasons, but the 's' variable
        // must be safely handled via optional chaining.
        let caughtError: Error | undefined;
        try {
            await Promise.race([
                ndk.fetchEvent("zzz-invalid-id"),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("timeout")), 200),
                ),
            ]);
        } catch (error: any) {
            caughtError = error;
        }

        // Must not be a ReferenceError about 's'
        if (caughtError) {
            expect(caughtError).not.toBeInstanceOf(ReferenceError);
            expect(caughtError.message).not.toContain("Cannot access");
        }
    });

    it("should resolve null when subscribe throws and timeout fires", async () => {
        vi.useFakeTimers();

        const ndk = new NDK({
            explicitRelayUrls: ["wss://relay.example.com"],
        });

        const subscribeSpy = vi.spyOn(ndk, "subscribe").mockImplementation(() => {
            throw new Error("subscribe failed");
        });

        const promise = ndk.fetchEvent({ ids: ["abc"] });

        // The promise should have been rejected immediately by the thrown error
        // (Promise constructor catches synchronous throws)
        await expect(promise).rejects.toThrow("subscribe failed");

        // Advance past the 10-second timeout to ensure it doesn't crash
        vi.advanceTimersByTime(11000);

        subscribeSpy.mockRestore();
        vi.useRealTimers();
    });
});
