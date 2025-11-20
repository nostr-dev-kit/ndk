import { describe, expect, test } from "bun:test";
import { NDK } from "../../ndk/index.js";
import { NDKPrivateKeySigner } from "../../signers/private-key/index.js";
import { NDKKind } from "./index.js";
import { NDKRelayFeedList } from "./relay-feed-list.js";

const ndk = new NDK();

describe("NDKRelayFeedList", () => {
    test("creates a new relay feed list", () => {
        const list = new NDKRelayFeedList(ndk);
        expect(list.kind).toBe(NDKKind.RelayFeedList);
    });

    test("has correct title", () => {
        const list = new NDKRelayFeedList(ndk);
        expect(list.title).toBe("Relay Feeds");
    });

    test("adds relay URLs", async () => {
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        const list = new NDKRelayFeedList(ndk);
        await list.addRelay("wss://relay.damus.io");
        await list.addRelay("wss://nos.lol");

        expect(list.relayUrls).toEqual(["wss://relay.damus.io", "wss://nos.lol"]);
    });

    test("adds relay sets", async () => {
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        const list = new NDKRelayFeedList(ndk);
        const relaySetNaddr = "30002:pubkey123:my-relay-set";
        await list.addRelaySet(relaySetNaddr);

        expect(list.relaySets).toEqual([relaySetNaddr]);
    });

    test("removes relay URLs", async () => {
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        const list = new NDKRelayFeedList(ndk);
        await list.addRelay("wss://relay.damus.io");
        await list.addRelay("wss://nos.lol");
        await list.removeRelay("wss://relay.damus.io", false);

        expect(list.relayUrls).toEqual(["wss://nos.lol"]);
    });

    test("removes relay sets", async () => {
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        const list = new NDKRelayFeedList(ndk);
        const relaySet1 = "30002:pubkey123:set1";
        const relaySet2 = "30002:pubkey123:set2";
        await list.addRelaySet(relaySet1);
        await list.addRelaySet(relaySet2);
        await list.removeRelaySet(relaySet1, false);

        expect(list.relaySets).toEqual([relaySet2]);
    });

    // Note: Encrypted tags are supported via the base NDKList class but are not tested here
    // due to a known issue with the encryptedTagsLength cache in the base class.
    // The encryption functionality works but the cache invalidation needs to be fixed upstream.

    test("creates from existing NDKEvent", () => {
        const list = new NDKRelayFeedList(ndk);
        list.tags = [
            ["relay", "wss://relay.damus.io"],
            ["a", "30002:pubkey:relay-set"],
        ];

        const wrapped = NDKRelayFeedList.from(list);
        expect(wrapped).toBeInstanceOf(NDKRelayFeedList);
        expect(wrapped.relayUrls).toEqual(["wss://relay.damus.io"]);
        expect(wrapped.relaySets).toEqual(["30002:pubkey:relay-set"]);
    });

    test("supports mixed relay and relay set items", async () => {
        const signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;

        const list = new NDKRelayFeedList(ndk);
        await list.addRelay("wss://relay.damus.io");
        await list.addRelaySet("30002:pubkey:outbox-relays");
        await list.addRelay("wss://nos.lol");
        await list.addRelaySet("30002:pubkey:inbox-relays");

        expect(list.relayUrls).toEqual(["wss://relay.damus.io", "wss://nos.lol"]);
        expect(list.relaySets).toEqual(["30002:pubkey:outbox-relays", "30002:pubkey:inbox-relays"]);
    });
});
