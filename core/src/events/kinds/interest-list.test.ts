import { beforeEach, describe, expect, test } from "bun:test";
import { NDKEvent } from "../../events/index.js";
import { NDK } from "../../ndk/index.js";
import { NDKKind } from "./index.js";
import { NDKInterestList } from "./interest-list.js";

describe("NDKInterestList", () => {
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
    });

    test("creates an interest list with correct kind", () => {
        const list = new NDKInterestList(ndk);
        expect(list.kind).toBe(NDKKind.InterestList);
        expect(list.kind).toBe(10015);
    });

    test("gets interests from tags", () => {
        const list = new NDKInterestList(ndk);
        list.tags = [
            ["t", "nostr"],
            ["t", "bitcoin"],
            ["t", "technology"],
        ];

        const interests = list.interests;
        expect(interests).toEqual(["nostr", "bitcoin", "technology"]);
    });

    test("sets interests replacing existing ones", () => {
        const list = new NDKInterestList(ndk);
        list.tags = [
            ["t", "old"],
            ["title", "My Interests"],
        ];

        list.interests = ["nostr", "bitcoin"];

        expect(list.interests).toEqual(["nostr", "bitcoin"]);
        expect(list.tagValue("title")).toBe("My Interests");
    });

    test("adds interest without duplicates", () => {
        const list = new NDKInterestList(ndk);
        list.addInterest("nostr");
        list.addInterest("bitcoin");
        list.addInterest("nostr"); // duplicate

        expect(list.interests).toEqual(["nostr", "bitcoin"]);
    });

    test("removes interest", () => {
        const list = new NDKInterestList(ndk);
        list.interests = ["nostr", "bitcoin", "technology"];

        list.removeInterest("bitcoin");

        expect(list.interests).toEqual(["nostr", "technology"]);
    });

    test("checks if interest exists", () => {
        const list = new NDKInterestList(ndk);
        list.interests = ["nostr", "bitcoin"];

        expect(list.hasInterest("nostr")).toBe(true);
        expect(list.hasInterest("ethereum")).toBe(false);
    });

    test("gets interest set references from a tags", () => {
        const list = new NDKInterestList(ndk);
        list.tags = [
            ["t", "nostr"],
            ["a", "30015:pubkey1:tech"],
            ["a", "30015:pubkey2:crypto"],
            ["a", "30023:pubkey3:article"], // different kind, should be included
        ];

        const refs = list.interestSetReferences;
        expect(refs).toEqual(["30015:pubkey1:tech", "30015:pubkey2:crypto"]);
    });

    test("creates from existing NDKEvent", () => {
        const event = new NDKEvent(ndk);
        event.kind = NDKKind.InterestList;
        event.tags = [["t", "nostr"]];

        const list = NDKInterestList.from(event);

        expect(list).toBeInstanceOf(NDKInterestList);
        expect(list.kind).toBe(NDKKind.InterestList);
        expect(list.interests).toEqual(["nostr"]);
    });

    test("handles empty interests list", () => {
        const list = new NDKInterestList(ndk);
        expect(list.interests).toEqual([]);
        expect(list.interestSetReferences).toEqual([]);
    });

    test("updates created_at when adding interest", () => {
        const list = new NDKInterestList(ndk);
        const before = Math.floor(Date.now() / 1000);

        list.addInterest("nostr");

        expect(list.created_at).toBeGreaterThanOrEqual(before);
    });

    test("updates created_at when removing interest", () => {
        const list = new NDKInterestList(ndk);
        list.interests = ["nostr", "bitcoin"];
        const before = Math.floor(Date.now() / 1000);

        list.removeInterest("nostr");

        expect(list.created_at).toBeGreaterThanOrEqual(before);
    });
});
