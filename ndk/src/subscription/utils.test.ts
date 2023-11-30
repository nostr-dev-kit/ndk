import { NDKFilter, NDKSubscription } from ".";
import { NDK } from "../ndk";
import { generateSubId } from "./utils";

const ndk = new NDK();

describe("generateSubId", () => {
    it("generates a subId based on the subscriptions' subIds", () => {
        const sub1 = new NDKSubscription(ndk, { kinds: [1] }, { subId: "sub1" });
        const sub2 = new NDKSubscription(ndk, { authors: ["abc"] }, { subId: "sub2" });

        const subId = generateSubId([sub1, sub2], [{ kinds: [1] }, { authors: ["abc"] }]);

        expect(subId).toMatch(/sub1,sub2-\d+/);
    });

    it("generates a subId based on the filters when there is no subId", () => {
        const sub1Filter = { kinds: [1] };
        const sub2Filter = { kinds: [2], authors: ["abc"] };
        const sub1 = new NDKSubscription(ndk, sub1Filter);
        const sub2 = new NDKSubscription(ndk, sub2Filter);

        const subId = generateSubId([sub1, sub2], [sub1Filter, sub2Filter]);

        expect(subId).toMatch(/kinds:1,2-authors-\d+/);
    });

    it("generates a subId based on the filters when there is no subId", () => {
        const sub1Filter = { kinds: [1] };
        const sub2Filter = { kinds: [2], authors: ["abc"] };
        const sub1 = new NDKSubscription(ndk, sub1Filter);
        const sub2 = new NDKSubscription(ndk, sub2Filter);

        const subId = generateSubId([sub1, sub2], [sub1Filter, sub2Filter]);

        expect(subId).toMatch(/kinds:1,2-authors-\d+/);
    });

    it("it doesn't generate huge subscriptions ids", () => {
        const subscriptions: NDKSubscription[] = [];
        const filter: NDKFilter = { kinds: [10002], authors: [] };

        for (let i = 0; i < 100; i++) {
            const id = `aaaaa${i}`;
            subscriptions.push(
                new NDKSubscription(
                    ndk,
                    { kinds: [10002], authors: [id] },
                    { groupable: true, subId: `relay-list-${id}` }
                )
            );
            filter.authors?.push(id);
        }

        const subId = generateSubId(subscriptions, [filter]);
        expect(subId.length).toBeLessThanOrEqual(24);
    });
});
