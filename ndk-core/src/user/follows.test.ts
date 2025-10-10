import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventGenerator } from "../../test";
import { NDK } from "../ndk";
import { NDKUser } from ".";

describe("follows", () => {
    const ndk = new NDK();
    const user = ndk.getUser({
        pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
    });
    user.ndk = ndk;

    const followedHexpubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

    const fetchEventMock = vi.spyOn(ndk, "fetchEvent");

    beforeEach(() => {
        // Set up the EventGenerator with our NDK instance
        EventGenerator.setNDK(ndk);
    });

    it("skips tags on the contact list with invalid pubkeys", async () => {
        fetchEventMock.mockImplementation(() => {
            const e = EventGenerator.createEvent(3); // Kind 3 is for contact lists
            e.tags = [["p", "invalid-pubkey"]];
            e.tags = [["p", followedHexpubkey]];
            return new Promise((resolve) => resolve(e));
        });

        const followedUsers = await user.follows();
        expect(followedUsers.size).toBe(1);

        for (const followedUser of followedUsers) {
            expect(followedUser).toBeInstanceOf(NDKUser);
            expect(followedUser.pubkey).toBe(followedHexpubkey);
            expect(followedUser.ndk).toBe(user.ndk);
        }
    });

    it("dedupes followed users", async () => {
        fetchEventMock.mockImplementation(() => {
            const e = EventGenerator.createEvent(3); // Kind 3 is for contact lists
            e.tags = [["p", "invalid-pubkey"]];
            e.tags = [["p", followedHexpubkey]];
            e.tags = [["p", followedHexpubkey]];
            return new Promise((resolve) => resolve(e));
        });

        const followedUsers = await user.follows();
        expect(followedUsers.size).toBe(1);

        for (const followedUser of followedUsers) {
            expect(followedUser).toBeInstanceOf(NDKUser);
            expect(followedUser.pubkey).toBe(followedHexpubkey);
            expect(followedUser.ndk).toBe(user.ndk);
        }
    });
});
