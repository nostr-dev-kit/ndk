import { NDK } from "../../ndk/index.js";
import type { NDKPool } from "../pool/index.js";
import { calculateRelaySetsFromFilters } from "./calculate.js";

const explicitRelayUrl = "wss://explicit-relay.com";
const ndk = new NDK({ explicitRelayUrls: [explicitRelayUrl] });

describe("calculateRelaySetsFromFilters", () => {
    it("falls back to the explicit relay when authors don't have relays", () => {
        const filters = [{ authors: ["a", "b", "c"], kinds: [0] }];
        const sets = calculateRelaySetsFromFilters(ndk, filters, ndk.pool);
        expect(sets.get(explicitRelayUrl)).toEqual([{ authors: ["a", "b", "c"], kinds: [0] }]);
    });

    /**
     *
     * The below tests aren't testing anything right now.
     * We need to refactor/rewrite all the tests around relay selection and sorting.
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
