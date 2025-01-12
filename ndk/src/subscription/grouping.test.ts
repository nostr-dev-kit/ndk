import { filterFingerprint, mergeFilters } from "./grouping.js";
import type { NDKFilter } from "./index.js";

describe("mergeFilters", () => {
    it("merges filters with the same keys", () => {
        const filters = [
            { kinds: [1], authors: ["author1"] },
            { kinds: [1], authors: ["author2"] },
        ];

        expect(mergeFilters(filters)).toEqual([{ kinds: [1], authors: ["author1", "author2"] }]);
    });

    it("concatenates filters that have a limit", () => {
        const filters = [
            { kinds: [1], authors: ["author1"], limit: 1 },
            { kinds: [1], authors: ["author2"], limit: 5 },
        ];

        expect(mergeFilters(filters)).toEqual([
            { kinds: [1], authors: ["author1"], limit: 1 },
            { kinds: [1], authors: ["author2"], limit: 5 },
        ]);
    });
});

describe("filterFingerprint", () => {
    it("includes filters in the ID", () => {
        const filters = [{ kinds: [1], authors: ["author1"] }];

        expect(filterFingerprint(filters, false)).toEqual("authors-kinds");
    });

    it("order of keys is irrelevant", () => {
        const filters = [{ authors: ["author1"], kinds: [1] }];

        expect(filterFingerprint(filters, false)).toEqual("authors-kinds");
    });

    it("includes value of since in the fingerprint", () => {
        const filters = [{ kinds: [1], authors: ["author1"], since: 1 }];

        expect(filterFingerprint(filters, false)).toBe("authors-kinds-since:1");
    });

    it("includes value of until in the fingerprint", () => {
        const filters = [{ kinds: [1], authors: ["author1"], until: 1 }];

        expect(filterFingerprint(filters, false)).toBe("authors-kinds-until:1");
    });

    it("includes value of all time constraints in the fingerprint", () => {
        const filters = [{ kinds: [1], authors: ["author1"], since: 1, until: 100 }];

        expect(filterFingerprint(filters, false)).toBe("authors-kinds-since:1-until:100");
    });

    it("generates different group IDs when the same filter keys are used but in incompatible filters", () => {
        const filters1: NDKFilter[] = [{ kinds: [1], authors: ["author1"] }, { "#e": ["id1"] }];
        const filters2: NDKFilter[] = [{ kinds: [1] }, { authors: ["author2"], "#e": ["id2"] }];

        expect(filterFingerprint(filters1, false)).not.toEqual(filterFingerprint(filters2, false));
    });

    it("generates the same group IDs with multiple compatible filters", () => {
        const filters1: NDKFilter[] = [{ kinds: [1] }, { authors: ["author1"], "#e": ["id1"] }];
        const filters2: NDKFilter[] = [{ kinds: [1] }, { authors: ["author2"], "#e": ["id2"] }];

        expect(filterFingerprint(filters1, false)).toEqual(filterFingerprint(filters2, false));
    });
});
