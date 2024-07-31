import type { NostrEvent } from "../../events/index.js";
import { NDKEvent } from "../../events/index.js";
import { NDKRelayList } from "../../events/kinds/NDKRelayList.js";
import { NDK } from "../../ndk/index.js";
import { NDKPrivateKeySigner } from "../../signers/private-key/index.js";
import type { Hexpubkey, NDKUser } from "../../user/index.js";
import { calculateRelaySetFromEvent, calculateRelaySetsFromFilters } from "./calculate.js";

const explicitRelayUrl = "wss://explicit-relay.com/";

const signers = [
    NDKPrivateKeySigner.generate(),
    NDKPrivateKeySigner.generate(),
    NDKPrivateKeySigner.generate(),
    NDKPrivateKeySigner.generate(),
    NDKPrivateKeySigner.generate(),
];

let ndk: NDK;
const users: NDKUser[] = [];
const readRelays: string[][] = [];
const writeRelays: string[][] = [];

beforeEach(() => {
    ndk = new NDK({
        explicitRelayUrls: [explicitRelayUrl],
        enableOutboxModel: true,
    });
});

beforeAll(async () => {
    signers.forEach(async (signer, i) => {
        const user = await signer.user();
        users[i] = user;
        readRelays[i] = [
            // relays that will have users in common
            `wss://relay${i}/`,
            `wss://relay${i + 2}/`,

            // a relay only this user will have
            `wss://user${i}-relay/`,
        ];
        writeRelays[i] = [
            // relays that will have users in common
            `wss://relay${i}/`,
            `wss://relay${i + 1}/`,

            // a relay only this user will have
            `wss://user${i}-relay/`,
        ];
    });
});

jest.mock("../../utils/get-users-relay-list.js", () => ({
    getRelayListForUsers: jest.fn(async () => {
        const map = new Map<Hexpubkey, NDKEvent>();
        users.forEach((user, i) => {
            const list = new NDKRelayList(ndk) as any;
            jest.spyOn(list, "readRelayUrls", "get").mockReturnValue(readRelays[i]);
            jest.spyOn(list, "writeRelayUrls", "get").mockReturnValue(writeRelays[i]);
            map.set(user.pubkey, list);
        });

        return map;
    }),
}));

afterAll(() => {
    jest.clearAllMocks();
});

function combineRelays(relays: string[][]) {
    const relaySet = new Set<string>();
    relays.forEach((r) => r.forEach((relay) => relaySet.add(relay)));
    return Array.from(relaySet);
}

describe("calculateRelaySetFromEvent", () => {
    it("prefers to use the author's write relays", async () => {
        const event = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
        await event.sign(signers[0]);
        const set = await calculateRelaySetFromEvent(ndk, event);

        const expectedRelays = combineRelays([writeRelays[0], [explicitRelayUrl]]);

        expect(set.relayUrls).toEqual(expectedRelays);
    });

    it("writes to the p-tagged pubkey write relays", async () => {
        const event = new NDKEvent(ndk, { kind: 1 } as NostrEvent);

        const taggedUserIndexes = [1, 2, 4];
        for (const i of taggedUserIndexes) {
            event.tag(users[i]);
        }
        await event.sign(signers[0]);

        const result = await calculateRelaySetFromEvent(ndk, event);
        const resultedRelays = result.relayUrls;

        // Each user should have at least one relay
        for (const i of taggedUserIndexes) {
            const readRelaysOfTaggedUser = readRelays[i];
            let includedRelays = 0;

            for (const relay of readRelaysOfTaggedUser) {
                if (resultedRelays.includes(relay)) {
                    includedRelays++;
                }
            }

            expect(includedRelays).toBeGreaterThan(0);
        }

        // expect it to include all the write relays of the author
        for (const relay of writeRelays[0]) {
            expect(resultedRelays).toContain(relay);
        }
    });

    it("if some tagged pubkey doesn't have write relays, writes to the explicit relay list", async () => {
        const userWithoutRelays = ndk.getUser({
            pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
        });
        const event = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
        event.tag(userWithoutRelays);
        await event.sign(signers[0]);

        const result = await calculateRelaySetFromEvent(ndk, event);
        const resultedRelays = result.relayUrls;

        const expectedRelays = writeRelays[0];
        expectedRelays.push(explicitRelayUrl);

        expect(resultedRelays).toEqual(expectedRelays);
    });

    it("writes to any relay that has been hinted at too", async () => {
        const event = new NDKEvent(ndk, { kind: 1 } as NostrEvent);
        event.tags.push(["e", "123", "wss://hinted-relay.com/"]);
        await event.sign(signers[0]);

        const result = await calculateRelaySetFromEvent(ndk, event);
        const resultedRelays = result.relayUrls;

        expect(resultedRelays).toContain("wss://hinted-relay.com/");
    });
});

describe("calculateRelaySetsFromFilters", () => {
    it("falls back to the explicit relay when authors don't have relays", () => {
        const filters = [{ authors: ["a", "b", "c"], kinds: [0] }];
        const sets = calculateRelaySetsFromFilters(ndk, filters, ndk.pool);
        expect(sets.get(explicitRelayUrl)).toEqual([{ authors: ["a", "b", "c"], kinds: [0] }]);
    });

    /**
     *
     * The below tests aren't testing anything right now.
     * TODO: We need to refactor/rewrite all the tests around relay selection
     * and sorting.
     *
     **/

    // it("sends authors-less filters to all relays", () => {
    //     const filters = [{ authors: ["a", "b", "c"], kinds: [0] }, { kinds: [1] }];

    //     const sets = calculateRelaySetsFromFilters({} as NDK, filters, {} as NDKPool);
    //     const relay1 = sets.get("relay1");
    //     const relay2 = sets.get("relay2");
    //     const relay3 = sets.get("relay3");

    //     expect(relay1).toEqual([{ authors: ["a"], kinds: [0] }, { kinds: [1] }]);
    //     expect(relay2).toEqual([{ authors: ["b", "c"], kinds: [0] }, { kinds: [1] }]);
    //     expect(relay3).toEqual([{ authors: ["c"], kinds: [0] }, { kinds: [1] }]);
    // });

    // it("sends authors whose relay is unknown to the pool explicit relays", () => {
    //     const filters = [{ authors: ["a", "b", "c", "d"], kinds: [0] }];

    //     const sets = calculateRelaySetsFromFilters(ndk, filters, ndk.pool);

    //     const relay1 = sets.get("relay1");
    //     const relay2 = sets.get("relay2");
    //     const relay3 = sets.get("relay3");
    //     const explicitRelay = sets.get(explicitRelayUrl);

    //     expect(relay1).toEqual([{ authors: ["a"], kinds: [0] }]);
    //     expect(relay2).toEqual([{ authors: ["b", "c"], kinds: [0] }]);
    //     expect(relay3).toEqual([{ authors: ["c"], kinds: [0] }]);
    //     expect(explicitRelay).toEqual([{ authors: ["d"], kinds: [0] }]);
    // });

    // it("sends filters with no authors to explicit relays", () => {
    //     const filters = [{ kinds: [0] }];

    //     const sets = calculateRelaySetsFromFilters(ndk, filters, ndk.pool);

    //     const relay1 = sets.get("relay1");
    //     const explicitRelay = sets.get(explicitRelayUrl);

    //     expect(relay1).toBe(undefined);
    //     expect(explicitRelay).toEqual([{ kinds: [0] }]);
    // });
});
