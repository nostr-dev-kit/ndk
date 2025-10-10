import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../ndk/index.js";
import { NDKRelay } from "../relay/index.js";
import { NDKPool } from "../relay/pool/index.js";
import { NDKUser } from "../user/index.js";
import { OutboxTracker } from "./tracker.js";

describe("OutboxTracker", () => {
    let ndk: NDK;

    beforeEach(() => {
        vi.clearAllMocks();
        ndk = new NDK();
    });

    it("increases the reference count when tracking an existing user", () => {
        const tracker = new OutboxTracker(ndk);
        const user = new NDKUser({
            pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });
        const user2 = new NDKUser({
            pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });

        tracker.track(user);
        tracker.track(user2);
    });

    it("uses nprofile relay hints when fetching kind 10002", async () => {
        // Create an nprofile with relay hints
        const nprofileWithHints =
            "nprofile1qqs04xzt6ldm9qhs0ctw0t58kf4z57umjzmjg6jywu0seadwtqqc75spr9mhxue69uhhq7tjv9kkjepwve5kzar2v9nzucm0d5qscamnwvaz7tmxxaazu6t0f6uyq5";

        // Create user from nprofile
        const user = ndk.getUser(nprofileWithHints);

        // Verify relay hints were extracted from nprofile
        expect(user.relayUrls).toEqual(["wss://pyramid.fiatjaf.com", "wss://f7z.io"]);

        // Mock the pool's getRelay method to track which relays are requested
        const requestedRelays = new Set<string>();
        const mockPool = ndk.pool || new NDKPool();

        // Mock getRelay to track which relays are requested
        vi.spyOn(mockPool, "getRelay").mockImplementation((url: string, connect?: boolean, temporary?: boolean) => {
            requestedRelays.add(url);
            // Create a mock relay with ndk instance
            const relay = new NDKRelay(url, undefined, ndk);
            return relay;
        });

        ndk.pool = mockPool;
        ndk.outboxPool = mockPool;

        // Mock subscribe to prevent actual network calls
        vi.spyOn(ndk, "subscribe").mockImplementation(() => {
            return { on: vi.fn(), start: vi.fn(), stop: vi.fn() } as any;
        });

        // Track the user (this should trigger relay list fetch with hints)
        const tracker = new OutboxTracker(ndk);
        await tracker.trackUsers([user]);

        // Verify that the relay hints from the nprofile were requested
        expect(requestedRelays.has("wss://pyramid.fiatjaf.com")).toBe(true);
        expect(requestedRelays.has("wss://f7z.io")).toBe(true);
    });
});
