import { NDKUser } from ".";
import { NDKEvent } from "../events/index";
import { NDK } from "../ndk";

describe("follows", () => {
    const ndk = new NDK();
    const user = ndk.getUser({
        pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
    });
    user.ndk = ndk;

    const followedHexpubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

    const fetchEventMock = jest.spyOn(ndk, "fetchEvent");

    it("skips tags on the contact list with invalid pubkeys", async () => {
        fetchEventMock.mockImplementation(() => {
            const e = new NDKEvent(ndk);
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
            const e = new NDKEvent(ndk);
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
