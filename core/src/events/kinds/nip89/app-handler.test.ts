import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../../../ndk/index.js";
import { NDKEvent } from "../../index.js";
import { NDKAppHandlerEvent } from "./app-handler";

const validEvent = {
    kind: 31990,
    id: "1dd29c0628790e20d7e5ce218bdb4e1db45fecf844b0afa9f2cefdb30b426a96",
    pubkey: "73c6bb92440a9344279f7a36aa3de1710c9198b1e9e8a394cd13e0dd5c994c63",
    created_at: 1704502265,
    tags: [
        ["d", "1704502265408"],
        ["published_at", "1704502265"],
        ["r", "https://highlighter.com"],
        ["alt", "Nostr App: Highlighter"],
        ["zap", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52", "wss://relay.nostr.band", "9"],
        ["zap", "73c6bb92440a9344279f7a36aa3de1710c9198b1e9e8a394cd13e0dd5c994c63", "wss://relay.nostr.band", "1"],
        ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52", "wss://relay.nostr.band", "author"],
        ["k", "9802"],
        ["k", "39802"],
        ["k", "30023"],
        ["k", "30001"],
        ["web", "https://highlighter.com/a/<bech32>", "naddr"],
        ["web", "https://highlighter.com/a/<bech32>", "nevent"],
        ["web", "https://highlighter.com/u/<bech32>", "npub"],
        ["web", "https://highlighter.com/u/<bech32>", "nprofile"],
        ["t", "productivity"],
        ["t", "news"],
        ["t", "reading"],
    ],
    content:
        '{"name":"Highlighter","display_name":"Highlighter","nip05":"","picture":"https://highlighter.com/favicon.svg","banner":"https://image.nostr.build/fdaae24f5124ca3549a790f6cd3f939aeaa853dd2dc059e8a9989802988b32c3.png","about":"Capture every passage","lud16":"pf7z@getalby.com","website":"https://highlighter.com"}',
    sig: "e79cdb9641f8cac1dd109965705654d7342f0870c469bf413c1b498377c298686ab03b3d9fbf7f1269903d27eec5851b8c20ad25809a73313d45561d74e5a13e",
};
const invalidEvent = {
    created_at: 1722398354,
    content:
        '{"name":"YakiHonne","display_name":"YakiHonne","nip05":"_@yakihonne.com","picture":"https://yakihonne.s3.ap-east-1.amazonaws.com/20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3/files/1691722198488-YAKIHONNES3.png","banner":"https://yakihonne.s3.ap-east-1.amazonaws.com/20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3/files/1700727820143-YAKIHONNES3.png","about":"YakiHonne is a Nostr-based decentralized content media protocol that supports blogs, flash news, curation, videos, uncensored notes, zaps, and other content types. Join us now and experience the joy of decentralized publishing, review and settlement media networks.","lud16":"yakihonne@getalby.com","website":"https://yakihonne.com/"}',
    tags: [
        ["d", "1700732875747"],
        ["published_at", "1700732875"],
        ["t", "social"],
        ["t", "news"],
        ["t", "messaging"],
        ["t", "video"],
        ["r", "https://yakihonne.com/"],
        ["alt", "Nostr App: YakiHonne"],
        ["r", "https://github.com/YakiHonne", "source"],
        ["k", "0"],
        ["k", "1"],
        ["k", "3"],
        ["k", "4"],
        ["k", "6"],
        ["k", "7"],
        ["k", "1984"],
        ["k", "9735"],
        ["k", "13194"],
        ["k", "30001"],
        ["k", "30003"],
        ["k", "30004"],
        ["k", "30023"],
        ["k", "31990"],
        ["web", "https://yakihonne.com/users/<bech32>", "nprofile"],
        ["web", "https://yakihonne.com/article/<bech32>", "naddr"],
        ["web", "https://yakihonne.com/curations/<bech32>", "naddr"],
        ["web", "https://yakihonne.com/notes/<bech32>", "nevent"],
        ["web", "https://yakihonne.com/videos/<bech32>", "naddr"],
        ["web", "https://yakihonne.com/flash-news/<bech32>", "nevent"],
        ["web", "https://yakihonne.com/uncensored-notes/<bech32>", "nevent"],
        ["android", "nostr:<bech32>", "nprofile"],
        ["android", "nostr:<bech32>", "naddr"],
        ["android", "nostr:<bech32>", "nevent"],
        ["ios", "nostr:<bech32>", "nprofile"],
        ["ios", "nostr:<bech32>", "naddr"],
        ["ios", "nostr:<bech32>", "nevent"],
    ],
    kind: 31990,
    pubkey: "20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3",
    id: "cbd471c34e2f3779007008a5333999000a35ae9e95710356bd3a8e8dd971bece",
    sig: "e7ffcccc3880a89127249733f82898a8e961fd0c6e1428f98b0f6b1aaa41ef673899a2503f8783c40ee6acc35303ffdd245e55660ef960066dd07ef8a94b0c2a",
};

describe("NDKAppHandlerEvent", () => {
    let ndk: NDK;
    let _appHandlerEvent: NDKAppHandlerEvent;

    beforeEach(() => {
        ndk = new NDK();
        _appHandlerEvent = new NDKAppHandlerEvent(ndk);
    });

    // Test cases will be added here
    it("returns null if the event is invalid", async () => {
        // Create an NDKEvent from the invalid event data
        const ndkEvent = new NDKEvent(ndk, invalidEvent);
        const invalidAppHandler = NDKAppHandlerEvent.from(ndkEvent);
        expect(invalidAppHandler).toBeNull();
    });

    it("returns the event if it is valid", async () => {
        // Create an NDKEvent from the valid event data
        const ndkEvent = new NDKEvent(ndk, validEvent);
        const validAppHandler = NDKAppHandlerEvent.from(ndkEvent);
        expect(validAppHandler).not.toBeNull();
    });
});
