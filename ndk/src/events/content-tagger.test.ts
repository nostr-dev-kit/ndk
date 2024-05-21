import { generateContentTags } from "./content-tagger";
import type { NDKTag } from "./index.js";

describe("await generateContentTags", () => {
    it("doesnt retag events that were quoted", async () => {
        const content =
            "testing a quoted event nostr:note1d2mheza0d5z5yycucu94nw37e6gyl4vwl6gavyku86rshkhexq6q30s0g7";
        const tags: NDKTag[] = [];
        tags.push(["q", "6ab77c8baf6d0542131cc70b59ba3ece904fd58efe91d612dc3e870bdaf93034"]);

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            tags
        );
        expect(processedContent).toEqual(content);
        expect(processedTags).toEqual([
            ["q", "6ab77c8baf6d0542131cc70b59ba3ece904fd58efe91d612dc3e870bdaf93034"],
        ]);
    });

    it("replaces valid tags and store decoded data in the tags array", async () => {
        const content =
            "This is a sample content with @npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft and @note1d2mheza0d5z5yycucu94nw37e6gyl4vwl6gavyku86rshkhexq6q30s0g7 tags.";
        const tags: NDKTag[] = [];

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            tags
        );

        expect(processedContent).toEqual(
            "This is a sample content with nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft and nostr:note1d2mheza0d5z5yycucu94nw37e6gyl4vwl6gavyku86rshkhexq6q30s0g7 tags."
        );
        expect(processedTags.length).toEqual(2);
        expect(processedTags).toEqual([
            ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            [
                "e",
                "6ab77c8baf6d0542131cc70b59ba3ece904fd58efe91d612dc3e870bdaf93034",
                "",
                "mention",
            ],
        ]);
    });

    it("does not replace invalid tags and leave the tags array unchanged", async () => {
        const content = "This is a sample content with an @invalidTag.";
        const tags: NDKTag[] = [];

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            tags
        );

        expect(processedContent).toEqual(content);
        expect(processedTags.length).toEqual(0);
    });

    it("handles existing tags and update indexes accordingly", async () => {
        const content =
            "This is a sample content with @npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft and @note1d2mheza0d5z5yycucu94nw37e6gyl4vwl6gavyku86rshkhexq6q30s0g7 tags.";
        const tags: NDKTag[] = [["p", "existing_p"]];

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            tags
        );

        expect(processedContent).toEqual(
            "This is a sample content with nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft and nostr:note1d2mheza0d5z5yycucu94nw37e6gyl4vwl6gavyku86rshkhexq6q30s0g7 tags."
        );
        expect(processedTags.length).toEqual(3);
        expect(processedTags).toEqual([
            ["p", "existing_p"],
            ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            [
                "e",
                "6ab77c8baf6d0542131cc70b59ba3ece904fd58efe91d612dc3e870bdaf93034",
                "",
                "mention",
            ],
        ]);
    });

    it("does not replace an event without a nostr: or @ prefix", async () => {
        const content =
            "note13jgf85r2yxjmww8f6gweque5g388agfztrppmgenur7zvh8e929s4cptur " +
            "@note13jgf85r2yxjmww8f6gweque5g388agfztrppmgenur7zvh8e929s4cptur";

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            []
        );

        expect(processedContent).toEqual(
            "note13jgf85r2yxjmww8f6gweque5g388agfztrppmgenur7zvh8e929s4cptur " +
                "nostr:note13jgf85r2yxjmww8f6gweque5g388agfztrppmgenur7zvh8e929s4cptur"
        );
        expect(processedTags).toEqual([
            [
                "e",
                "8c9093d06a21a5b738e9d21d907334444e7ea12258c21da333e0fc265cf92a8b",
                "",
                "mention",
            ],
        ]);
    });

    it("uses a mention marker", async () => {
        const content =
            "Hello world, nostr:note13jgf85r2yxjmww8f6gweque5g388agfztrppmgenur7zvh8e929s4cptur";
        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            []
        );

        expect(processedContent).toEqual(
            "Hello world, nostr:note13jgf85r2yxjmww8f6gweque5g388agfztrppmgenur7zvh8e929s4cptur"
        );
        expect(processedTags).toEqual([
            [
                "e",
                "8c9093d06a21a5b738e9d21d907334444e7ea12258c21da333e0fc265cf92a8b",
                "",
                "mention",
            ],
        ]);
    });

    it("handles replaceable event mentions", async () => {
        const content =
            "Hello world, nostr:naddr1qqrrywpn8y6rvq3qvwymuey3u7mf860ndrkw3r7dz30s0srg6tqmhtjzg7umtm6rn5eqxpqqqp65wnen4nu";
        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            []
        );

        expect(processedContent).toEqual(
            "Hello world, nostr:naddr1qqrrywpn8y6rvq3qvwymuey3u7mf860ndrkw3r7dz30s0srg6tqmhtjzg7umtm6rn5eqxpqqqp65wnen4nu"
        );
        expect(processedTags).toEqual([
            [
                "a",
                "30023:6389be6491e7b693e9f368ece88fcd145f07c068d2c1bbae4247b9b5ef439d32:283946",
                "",
                "mention",
            ],
            ["p", "6389be6491e7b693e9f368ece88fcd145f07c068d2c1bbae4247b9b5ef439d32"],
        ]);
    });

    it("uses the relay marker on nevents", async () => {
        const content =
            "Hello @nevent1qqsykmtd4zplclt56wfkkzjwplyw6q8a2p0fqf8p46wedlqayct0uhqppemhxue69uhkummn9ekx7mp0qgstryqhtnh5qlze8utuz42gpmdp5th87myyx78w7r5hx5lc0mjexqqrqsqqqqqpyazpkc";
        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            []
        );

        expect(processedContent).toEqual(
            "Hello nostr:nevent1qqsykmtd4zplclt56wfkkzjwplyw6q8a2p0fqf8p46wedlqayct0uhqppemhxue69uhkummn9ekx7mp0qgstryqhtnh5qlze8utuz42gpmdp5th87myyx78w7r5hx5lc0mjexqqrqsqqqqqpyazpkc"
        );
        expect(processedTags).toEqual([
            [
                "e",
                "4b6d6da883fc7d74d3936b0a4e0fc8ed00fd505e9024e1ae9d96fc1d2616fe5c",
                "wss://nos.lol/",
                "mention",
            ],
            ["p", "b190175cef407c593f17c155480eda1a2ee7f6c84378eef0e97353f87ee59300"],
        ]);
    });

    it("uses the relay marker on naddr", async () => {
        const content =
            "Hello @naddr1qqrrywpn8y6rvqgdwaehxw309ahx7uewd3hkcq3qvwymuey3u7mf860ndrkw3r7dz30s0srg6tqmhtjzg7umtm6rn5eqxpqqqp65wj55zc8";
        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            []
        );

        expect(processedContent).toEqual(
            "Hello nostr:naddr1qqrrywpn8y6rvqgdwaehxw309ahx7uewd3hkcq3qvwymuey3u7mf860ndrkw3r7dz30s0srg6tqmhtjzg7umtm6rn5eqxpqqqp65wj55zc8"
        );
        expect(processedTags).toEqual([
            [
                "a",
                "30023:6389be6491e7b693e9f368ece88fcd145f07c068d2c1bbae4247b9b5ef439d32:283946",
                "wss://nos.lol",
                "mention",
            ],
            ["p", "6389be6491e7b693e9f368ece88fcd145f07c068d2c1bbae4247b9b5ef439d32"],
        ]);
    });

    it("finds and store #tags in the tags array", async () => {
        const content = "This is a sample content with #tag1 and #tag2.";
        const tags: NDKTag[] = [];

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            tags
        );

        expect(processedContent).toEqual("This is a sample content with #tag1 and #tag2.");
        expect(processedTags.length).toEqual(2);
        expect(processedTags).toEqual([
            ["t", "tag1"],
            ["t", "tag2"],
        ]);
    });

    it("handles mixed types of tags", async () => {
        const content =
            "This is a sample content with #tag1 and @npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft.";
        const tags: NDKTag[] = [];

        const { content: processedContent, tags: processedTags } = await generateContentTags(
            content,
            tags
        );

        expect(processedContent).toEqual(
            "This is a sample content with #tag1 and nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft."
        );
        expect(processedTags.length).toEqual(2);
        expect(processedTags).toEqual([
            ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
            ["t", "tag1"],
        ]);
    });
});
