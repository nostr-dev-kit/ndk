import { calculateGroupableId } from "./grouping.js";
import type { NDKFilter } from "./index.js";

describe("calculateGroupableId", () => {
    it("includes filters in the ID", () => {
        const filters = [{ kinds: [1], authors: ["author1"] }];

        expect(calculateGroupableId(filters)).toEqual("authors-kinds");
    });

    it("order of keys is irrelevant", () => {
        const filters = [{ authors: ["author1"], kinds: [1] }];

        expect(calculateGroupableId(filters)).toEqual("authors-kinds");
    });

    it("does not group when there are time constraints", () => {
        const filters = [{ kinds: [1], authors: ["author1"], since: 1 }];

        expect(calculateGroupableId(filters)).toBeNull();
    });

    it("generates different group IDs when the same filter keys are used but in incompatible filters", () => {
        const filters1: NDKFilter[] = [{ kinds: [1], authors: ["author1"] }, { "#e": ["id1"] }];
        const filters2: NDKFilter[] = [{ kinds: [1] }, { authors: ["author2"], "#e": ["id2"] }];

        expect(calculateGroupableId(filters1)).not.toEqual(calculateGroupableId(filters2));
    });

    it("generates the same group IDs with multiple compatible filters", () => {
        const filters1: NDKFilter[] = [{ kinds: [1] }, { authors: ["author1"], "#e": ["id1"] }];
        const filters2: NDKFilter[] = [{ kinds: [1] }, { authors: ["author2"], "#e": ["id2"] }];

        expect(calculateGroupableId(filters1)).toEqual(calculateGroupableId(filters2));
    });
});
