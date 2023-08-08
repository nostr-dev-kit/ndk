import NDKEvent from "../events/index";
import NDK from "../index";
import NDKUser from "./index";

jest.mock("../index.js", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return {
                fetchEvents: jest.fn(),
            };
        }),
    };
});

describe("follows", () => {
    it("skips tags on the contact list with invalid pubkeys", async () => {
        const ndk = new NDK();
        const user = new NDKUser({
            hexpubkey:
                "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });
        user.ndk = ndk;

        const followedHexpubkey =
            "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (user.ndk!.fetchEvents as jest.Mock).mockImplementation(() => {
            const e = new NDKEvent(ndk);
            e.tags = [["p", "invalid-pubkey"]];
            e.tags = [["p", followedHexpubkey]];
            return new Set([e]);
        });

        const followedUsers = await user.follows();
        expect(followedUsers.size).toBe(1);

        for (const followedUser of followedUsers) {
            expect(followedUser).toBeInstanceOf(NDKUser);
            expect(followedUser.hexpubkey()).toBe(followedHexpubkey);
            expect(followedUser.ndk).toBe(user.ndk);
        }
    });

    it("dedupes followed users", async () => {
        const ndk = new NDK();
        const user = new NDKUser({
            hexpubkey:
                "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });
        user.ndk = ndk;

        const followedHexpubkey =
            "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (user.ndk!.fetchEvents as jest.Mock).mockImplementation(() => {
            const e = new NDKEvent(ndk);
            e.tags = [["p", "invalid-pubkey"]];
            e.tags = [["p", followedHexpubkey]];
            e.tags = [["p", followedHexpubkey]];
            return new Set([e]);
        });

        const followedUsers = await user.follows();
        expect(followedUsers.size).toBe(1);

        for (const followedUser of followedUsers) {
            expect(followedUser).toBeInstanceOf(NDKUser);
            expect(followedUser.hexpubkey()).toBe(followedHexpubkey);
            expect(followedUser.ndk).toBe(user.ndk);
        }
    });
});
