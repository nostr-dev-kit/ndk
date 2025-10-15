import { describe, expect, it, vi } from "vitest";
import { NDKUser } from "../user/index.js";
import { NDK } from "./index.js";

describe("activeUser:change event", () => {
    it("should emit activeUser:change when activeUser is set", () => {
        const ndk = new NDK();
        const listener = vi.fn();

        ndk.on("activeUser:change", listener);

        const user = new NDKUser({ pubkey: "test-pubkey" });
        ndk.activeUser = user;

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toBe(user);
    });

    it("should emit activeUser:change when activeUser changes to a different user", () => {
        const ndk = new NDK();
        const listener = vi.fn();

        const user1 = new NDKUser({ pubkey: "pubkey1" });
        ndk.activeUser = user1;

        ndk.on("activeUser:change", listener);

        const user2 = new NDKUser({ pubkey: "pubkey2" });
        ndk.activeUser = user2;

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toBe(user2);
    });

    it("should not emit activeUser:change when set to the same user", () => {
        const ndk = new NDK();
        const listener = vi.fn();

        const user = new NDKUser({ pubkey: "test-pubkey" });
        ndk.activeUser = user;

        ndk.on("activeUser:change", listener);

        // Set to same user (same pubkey)
        const sameUser = new NDKUser({ pubkey: "test-pubkey" });
        ndk.activeUser = sameUser;

        expect(listener).not.toHaveBeenCalled();
    });

    it("should emit activeUser:change when activeUser is cleared", () => {
        const ndk = new NDK();
        const listener = vi.fn();

        const user = new NDKUser({ pubkey: "test-pubkey" });
        ndk.activeUser = user;

        ndk.on("activeUser:change", listener);

        ndk.activeUser = undefined;

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toBeUndefined();
    });

    it("should emit activeUser:change when signer is set", async () => {
        const ndk = new NDK();
        const listener = vi.fn();

        ndk.on("activeUser:change", listener);

        // Create a mock signer
        const mockUser = new NDKUser({ pubkey: "signer-pubkey" });
        const mockSigner = {
            user: vi.fn().mockResolvedValue(mockUser),
        };

        ndk.signer = mockSigner as any;

        // Wait for async user() call to complete
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(listener).toHaveBeenCalled();
        expect(listener.mock.calls[0][0]).toBe(mockUser);
    });
});
