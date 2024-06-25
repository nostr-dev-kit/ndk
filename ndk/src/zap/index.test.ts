import { NDKZap } from ".";
import { NDKEvent } from "../events/index.js";
import { NDK } from "../ndk/index.js";
import { Hexpubkey } from "../user";
import { NDKRelayList } from "../events/kinds/NDKRelayList.js";

const ndk = new NDK();
const user1 = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
});
const user2 = ndk.getUser({
    npub: "npub1hkmj8cfap65e7gjy3x3auky7mfegjxll9jfk2jed3w9gsnh9j5gsd24r62",
});
const user3 = ndk.getUser({
    npub: "npub15z0mnjepscd9hk3ywkcvuupap7tt0qle64f0uvvygpl3mqerz4tq4dl33y",
});

const relays = [
    [
        "wss://user1-A",
        "wss://user1-B",
        "wss://user1-user2-A",
        "wss://user1-user2-B",
        "wss://user1-C",
        "wss://user1-D",
        "wss://user1-E",
        "wss://user1-F",
        "wss://user1-G",
        "wss://user1-H",
        "wss://user1-I",
        "wss://user1-J",
        "wss://user1-K",
        "wss://user1-L",
        "wss://user1-M",
        "wss://user1-N",
        "wss://user1-O",
        "wss://user1-P",
        "wss://user1-Q",
        "wss://user1-R",
        "wss://user1-S",
        "wss://user1-T",
        "wss://user1-U",
        "wss://user1-V",
        "wss://user1-W",
        "wss://user1-X",
        "wss://user1-Y",
        "wss://user1-Z",
    ],
    ["wss://user2-A", "wss://user2-B", "wss://user1-user2-A", "wss://user1-user2-B"],
];

jest.mock("../utils/get-users-relay-list.js", () => ({
    getRelayListForUsers: jest.fn(() => {
        const map = new Map<Hexpubkey, NDKEvent>();
        const e1 = new NDKRelayList(ndk) as any;
        jest.spyOn(e1, "readRelayUrls", "get").mockReturnValue(relays[0]);
        map.set(user1.npub, e1);

        const e2 = new NDKRelayList(ndk) as any;
        jest.spyOn(e2, "readRelayUrls", "get").mockReturnValue(relays[1]);
        map.set(user2.npub, e2);

        return map;
    }),
}));

afterAll(() => {
    jest.clearAllMocks();
});

describe("NDKZap", () => {
    describe("relay", () => {
        it("prefers relays that both sender and receiver have in common", async () => {
            ndk.activeUser = user1;
            const zap = new NDKZap({
                ndk,
                zappedUser: user2,
            });

            const r = await zap.relays();

            expect(r.slice(0, 2).includes("wss://user1-user2-A")).toBe(true);
            expect(r.slice(0, 2).includes("wss://user1-user2-B")).toBe(true);

            expect(r.length).toBeLessThanOrEqual(3);
        });

        it("correctly uses sender relays when we don't have relays for the receiver", async () => {
            ndk.activeUser = user1;
            const zap = new NDKZap({
                ndk,
                zappedUser: user3,
            });

            const r = await zap.relays();

            for (const relay of r) {
                expect(relays[0].includes(relay)).toBe(true);
            }

            expect(r.length).toBeGreaterThanOrEqual(3);
        });
    });
});
