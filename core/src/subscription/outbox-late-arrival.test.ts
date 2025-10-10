import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignerGenerator, UserGenerator } from "../../test/helpers/test-fixtures";
import { RelayMock } from "../../test/mocks/relay-mock";
import { RelayPoolMock } from "../../test/mocks/relay-pool-mock";
import { NDKEvent } from "../events";
import { NDKRelayList } from "../events/kinds/relay-list";
import { NDK } from "../ndk";
import { OutboxTracker } from "../outbox/tracker";
import { NDKSubscription } from "./index";

describe("Subscription with late-arriving relay list", () => {
    let ndk: NDK;
    let pool: RelayPoolMock;
    let explicitRelay: RelayMock;
    let authorRelay1: RelayMock;
    let authorRelay2: RelayMock;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create NDK with explicit relay and outbox enabled
        pool = new RelayPoolMock();
        explicitRelay = pool.addMockRelay("wss://explicit.relay");

        // Create author relays but DON'T add them to pool yet
        // They should only be added when outbox tracker discovers them
        authorRelay1 = new RelayMock("wss://relay.damus.io");
        authorRelay2 = new RelayMock("wss://relay.primal.net");

        // Override getRelay to handle author relays when they're requested
        const originalGetRelay = pool.getRelay.bind(pool);
        pool.getRelay = (url: string, connect = false, createIfNotExists = false, filters?: any) => {
            if (url === "wss://relay.damus.io") {
                if (!pool.mockRelays.has(url)) {
                    pool.addRelay(authorRelay1);
                    if (connect) authorRelay1.connect();
                }
                return authorRelay1 as any;
            }
            if (url === "wss://relay.primal.net") {
                if (!pool.mockRelays.has(url)) {
                    pool.addRelay(authorRelay2);
                    if (connect) authorRelay2.connect();
                }
                return authorRelay2 as any;
            }
            return originalGetRelay(url, connect, createIfNotExists, filters);
        };

        ndk = new NDK({
            explicitRelayUrls: ["wss://explicit.relay"],
            enableOutboxModel: true,
        });
        ndk.pool = pool as any;
        // outboxTracker is created automatically when enableOutboxModel is true
    });

    it("connects to author's relays when relay list arrives after subscription starts", async () => {
        const author = await UserGenerator.getUser("alice", ndk);
        const authorPubkey = author.pubkey;

        // Start subscription BEFORE relay list is available
        const sub = ndk.subscribe(
            { kinds: [10019], authors: [authorPubkey] },
            { closeOnEose: false, cacheUsage: 3 }, // ONLY_RELAY
        );

        // Wait for subscription to start
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Verify: REQ sent only to explicit relay initially
        const explicitMessages = explicitRelay.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );
        expect(explicitMessages.length).toBeGreaterThan(0);

        // Verify: Author's relays have NOT received REQ yet
        const authorRelay1Messages = authorRelay1.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );
        const authorRelay2Messages = authorRelay2.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );
        expect(authorRelay1Messages.length).toBe(0);
        expect(authorRelay2Messages.length).toBe(0);

        // Simulate: Author's relay list (kind 10002) arrives
        const relayListEvent = new NDKEvent(ndk, {
            kind: 10002,
            pubkey: authorPubkey,
            created_at: Math.floor(Date.now() / 1000),
            content: "",
            tags: [
                ["r", "wss://relay.damus.io"],
                ["r", "wss://relay.primal.net"],
            ],
        });
        await relayListEvent.sign(SignerGenerator.getSigner("alice"));

        // Manually trigger the outbox tracker update (simulating what would happen when the event arrives)
        const relayList = new NDKRelayList(ndk, relayListEvent);
        await ndk.outboxTracker!.trackUsers([author]);

        // Manually populate the outbox tracker with the relay list data
        // (In production, this would happen via getRelayListForUsers)
        const outboxItem = ndk.outboxTracker!.track(author);
        outboxItem.writeRelays = new Set(["wss://relay.damus.io", "wss://relay.primal.net"]);
        ndk.outboxTracker!.data.set(authorPubkey, outboxItem);

        // Manually emit the event (since we're bypassing trackUsers in the test)
        ndk.outboxTracker!.emit("user:relay-list-updated", authorPubkey, outboxItem);

        // Wait a tick for any hypothetical async reactions
        await new Promise((resolve) => setTimeout(resolve, 100));

        // EXPECTED: Subscription should NOW be connected to author's relays
        // This is the assertion that will FAIL until we implement the fix
        const authorRelay1MessagesAfter = authorRelay1.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );
        const authorRelay2MessagesAfter = authorRelay2.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );

        // These assertions will fail until we implement the fix
        expect(authorRelay1MessagesAfter.length).toBeGreaterThan(0);
        expect(authorRelay2MessagesAfter.length).toBeGreaterThan(0);

        // Verify the REQ contains the correct filter
        const relay1Req = JSON.parse(authorRelay1MessagesAfter[0].message);
        expect(relay1Req[0]).toBe("REQ");
        expect(relay1Req[2]).toMatchObject({
            kinds: [10019],
            authors: [authorPubkey],
        });

        sub.stop();
    });

    it("does not duplicate subscriptions when relay list arrives for already-connected relays", async () => {
        const author = await UserGenerator.getUser("bob", ndk);
        const authorPubkey = author.pubkey;

        // Pre-populate outbox tracker with relay list
        const outboxItem = ndk.outboxTracker!.track(author);
        outboxItem.writeRelays = new Set(["wss://explicit.relay"]); // Same as explicit relay
        ndk.outboxTracker!.data.set(authorPubkey, outboxItem);

        // Start subscription
        const sub = new NDKSubscription(ndk, { kinds: [10019], authors: [authorPubkey] }, {});
        sub.start();

        // Count initial REQs to explicit relay
        const initialReqs = explicitRelay.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );

        // Simulate relay list update with same relay
        outboxItem.writeRelays = new Set(["wss://explicit.relay"]);
        ndk.outboxTracker!.data.set(authorPubkey, outboxItem);

        await new Promise((resolve) => setTimeout(resolve, 10));

        // Verify: No duplicate REQs sent
        const finalReqs = explicitRelay.messageLog.filter(
            (m) => m.direction === "out" && m.message.includes("REQ") && m.message.includes("10019"),
        );
        expect(finalReqs.length).toBe(initialReqs.length);

        sub.stop();
    });
});
