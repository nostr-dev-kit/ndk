import { type NDKFilter, NDKSubscription } from ".";
import { NDK } from "../ndk";
import { filterForEventsTaggingId, filterFromId, generateSubId } from "./utils";

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

describe("filterFromId", () => {
    it("handles nevents", () => {
        const filter = filterFromId(
            "nevent1qgs9kqvr4dkruv3t7n2pc6e6a7v9v2s5fprmwjv4gde8c4fe5y29v0spzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqype6ycavy2e9zpx9mzeuekaahgw96ken0mzkcmgz40ljccwyrn88gxv2ewr"
        );
        expect(filter).toEqual({
            ids: ["73a263ac22b25104c5d8b3ccdbbdba1c5d5b337ec56c6d02abff2c61c41cce74"],
            authors: ["5b0183ab6c3e322bf4d41c6b3aef98562a144847b7499543727c5539a114563e"],
        });
    });
});

describe("filterForEventsTaggingId", () => {
    fit("handles nevents", () => {
        const filter = filterForEventsTaggingId(
            "nevent1qgs9kqvr4dkruv3t7n2pc6e6a7v9v2s5fprmwjv4gde8c4fe5y29v0spzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgtcqype6ycavy2e9zpx9mzeuekaahgw96ken0mzkcmgz40ljccwyrn88gxv2ewr"
        );
        expect(filter).toEqual({
            "#e": ["73a263ac22b25104c5d8b3ccdbbdba1c5d5b337ec56c6d02abff2c61c41cce74"],
        });
    });

    fit("handles naddr", () => {
        const filter = filterForEventsTaggingId(
            "naddr1qvzqqqr4gupzpjjwt0eqm6as279wf079c0j42jysp2t4s37u8pg5w2dfyktxgkntqqxnzde38yen2desxqmn2d3332u3ff"
        );
        expect(filter).toEqual({
            "#a": [
                "30023:ca4e5bf20debb0578ae4bfc5c3e55548900a975847dc38514729a92596645a6b:1719357007561",
            ],
        });
    });
});
