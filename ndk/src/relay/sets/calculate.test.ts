import { NDK } from "../../ndk/index.js";
import { calculateRelaySetsFromFilters } from "./calculate.js";

const explicitRelayUrl = "wss://explicit-relay.com";
const ndk = new NDK({ explicitRelayUrls: [explicitRelayUrl] });

describe("calculateRelaySetsFromFilters", () => {
    it("chooses available write relays for each author", () => {
        const filters = [{ authors: ["a", "b", "c"], kinds: [0] }];

        const sets = calculateRelaySetsFromFilters({} as NDK, filters);

        const relay1 = sets.get("relay1");
        const relay2 = sets.get("relay2");
        const relay3 = sets.get("relay3");

        expect(relay1).toEqual([{ authors: ["a"], kinds: [0] }]);
        expect(relay2).toEqual([{ authors: ["b", "c"], kinds: [0] }]);
        expect(relay3).toEqual([{ authors: ["c"], kinds: [0] }]);
    });

    it("sends authors-less filters to all relays", () => {
        const filters = [{ authors: ["a", "b", "c"], kinds: [0] }, { kinds: [1] }];

        const sets = calculateRelaySetsFromFilters({} as NDK, filters);

        const relay1 = sets.get("relay1");
        const relay2 = sets.get("relay2");
        const relay3 = sets.get("relay3");

        expect(relay1).toEqual([{ authors: ["a"], kinds: [0] }, { kinds: [1] }]);
        expect(relay2).toEqual([{ authors: ["b", "c"], kinds: [0] }, { kinds: [1] }]);
        expect(relay3).toEqual([{ authors: ["c"], kinds: [0] }, { kinds: [1] }]);
    });

    it("sends authors whose relay is unknown to the pool explicit relays", () => {
        const filters = [{ authors: ["a", "b", "c", "d"], kinds: [0] }];

        const sets = calculateRelaySetsFromFilters(ndk, filters);

        const relay1 = sets.get("relay1");
        const relay2 = sets.get("relay2");
        const relay3 = sets.get("relay3");
        const explicitRelay = sets.get(explicitRelayUrl);

        expect(relay1).toEqual([{ authors: ["a"], kinds: [0] }]);
        expect(relay2).toEqual([{ authors: ["b", "c"], kinds: [0] }]);
        expect(relay3).toEqual([{ authors: ["c"], kinds: [0] }]);
        expect(explicitRelay).toEqual([{ authors: ["d"], kinds: [0] }]);
    });

    it("sends filters with no authors to explicit relays", () => {
        const filters = [{ kinds: [0] }];

        const sets = calculateRelaySetsFromFilters(ndk, filters);

        const relay1 = sets.get("relay1");
        const explicitRelay = sets.get(explicitRelayUrl);

        expect(relay1).toBe(undefined);
        expect(explicitRelay).toEqual([{ kinds: [0] }]);
    });
});
