import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type RelayMock, RelayPoolMock } from "../../test";
import { NDKKind } from "../events/kinds";
import { NDK } from "../ndk";
import type { NDKRelay } from "../relay";
import { NDKRelaySet } from "../relay/sets";
import { type NDKFilter, NDKSubscription } from "../subscription";

describe("Filter Validation", () => {
    let ndk: NDK;
    let pool: RelayPoolMock;
    let mockRelay: RelayMock;

    // Valid hex pubkeys/ids for testing (64 character hex strings)
    const validPubkey1 = "0000000000000000000000000000000000000000000000000000000000000001";
    const validPubkey2 = "0000000000000000000000000000000000000000000000000000000000000002";
    const validPubkey3 = "0000000000000000000000000000000000000000000000000000000000000003";
    const validEventId1 = "1111111111111111111111111111111111111111111111111111111111111111";
    const validEventId2 = "2222222222222222222222222222222222222222222222222222222222222222";

    beforeEach(() => {
        // Create a mock relay pool
        pool = new RelayPoolMock();

        // Create NDK instance with explicit relay URLs
        ndk = new NDK({
            explicitRelayUrls: ["wss://relay.test.com"],
            // Start with validate mode by default
            filterValidationMode: "validate",
        });

        // Replace the relay pool with our mock
        // @ts-expect-error - We're intentionally replacing the pool for testing
        ndk.pool = pool;

        // Add a mock relay
        mockRelay = pool.addMockRelay("wss://relay.test.com");
    });

    afterEach(() => {
        pool.disconnectAll();
        pool.resetAll();
    });

    describe("Validate mode (default)", () => {
        it("should throw an error when filter contains undefined in authors array", () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                authors: [validPubkey1, undefined, validPubkey2],
                kinds: [NDKKind.Text],
            };

            expect(() => {
                ndk.subscribe(badFilter);
            }).toThrow("Invalid filter(s) detected");
        });

        it("should throw an error when filter contains undefined in kinds array", () => {
            const badFilter: NDKFilter = {
                authors: [validPubkey1],
                // @ts-expect-error - Intentionally passing bad data
                kinds: [NDKKind.Text, undefined, NDKKind.Metadata],
            };

            expect(() => {
                ndk.subscribe(badFilter);
            }).toThrow("Invalid filter(s) detected");
        });

        it("should throw an error when filter contains undefined in ids array", () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                ids: [validEventId1, undefined, validEventId2],
                kinds: [NDKKind.Text],
            };

            expect(() => {
                ndk.subscribe(badFilter);
            }).toThrow("Invalid filter(s) detected");
        });

        it("should throw an error when filter contains undefined in tag filters", () => {
            const badFilter: NDKFilter = {
                kinds: [NDKKind.Text],
                // @ts-expect-error - Intentionally passing bad data
                "#t": ["bitcoin", undefined, "nostr"],
            };

            expect(() => {
                ndk.subscribe(badFilter);
            }).toThrow("Invalid filter(s) detected");
        });

        it("should NOT throw when filter is valid", () => {
            const goodFilter: NDKFilter = {
                authors: [validPubkey1, validPubkey2],
                kinds: [NDKKind.Text, NDKKind.Metadata],
            };

            expect(() => {
                const sub = ndk.subscribe(goodFilter);
                sub.stop(); // Clean up
            }).not.toThrow();
        });

        it("should provide detailed error message with all issues", () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                authors: [validPubkey1, undefined],
                // @ts-expect-error - Intentionally passing bad data
                kinds: [NDKKind.Text, undefined],
                // @ts-expect-error - Intentionally passing bad data
                "#t": ["bitcoin", undefined],
            };

            expect(() => {
                ndk.subscribe(badFilter);
            }).toThrow(
                /Filter\[0\]\.authors\[1\] is undefined.*Filter\[0\]\.kinds\[1\] is undefined.*Filter\[0\]\.#t\[1\] is undefined/s,
            );
        });
    });

    describe("Fix mode", () => {
        beforeEach(() => {
            ndk.filterValidationMode = "fix";
        });

        it("should remove undefined values from authors and send clean filter to relay", async () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                authors: [validPubkey1, undefined, validPubkey2],
                kinds: [NDKKind.Text],
            };

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, badFilter, {
                subId: "test-sub-fix-authors",
                relaySet,
            });

            // Start the subscription
            sub.start();

            // Wait a bit for the subscription to be sent
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Check what was sent to the relay
            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            expect(sentMessages).toHaveLength(1);

            const sentMessage = JSON.parse(sentMessages[0].message);
            expect(sentMessage[0]).toBe("REQ");
            expect(sentMessage[1]).toBe("test-sub-fix-authors");

            const sentFilter = sentMessage[2];
            expect(sentFilter.authors).toEqual([validPubkey1, validPubkey2]); // undefined removed
            expect(sentFilter.kinds).toEqual([NDKKind.Text]);

            sub.stop();
        });

        it("should remove undefined values from kinds and send clean filter to relay", async () => {
            const badFilter: NDKFilter = {
                authors: [validPubkey1],
                // @ts-expect-error - Intentionally passing bad data
                kinds: [NDKKind.Text, undefined, NDKKind.Metadata],
            };

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, badFilter, {
                subId: "test-sub-fix-kinds",
                relaySet,
            });

            sub.start();
            await new Promise((resolve) => setTimeout(resolve, 10));

            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            const sentMessage = JSON.parse(sentMessages[0].message);
            const sentFilter = sentMessage[2];

            expect(sentFilter.kinds).toEqual([NDKKind.Text, NDKKind.Metadata]); // undefined removed
            expect(sentFilter.authors).toEqual([validPubkey1]);

            sub.stop();
        });

        it("should remove undefined values from tag filters and send clean filter to relay", async () => {
            const badFilter: NDKFilter = {
                kinds: [NDKKind.Text],
                // @ts-expect-error - Intentionally passing bad data
                "#t": ["bitcoin", undefined, "nostr"],
                // @ts-expect-error - Intentionally passing bad data
                "#p": [undefined, validPubkey1],
            };

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, badFilter, {
                subId: "test-sub-fix-tags",
                relaySet,
            });

            sub.start();
            await new Promise((resolve) => setTimeout(resolve, 10));

            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            const sentMessage = JSON.parse(sentMessages[0].message);
            const sentFilter = sentMessage[2];

            expect(sentFilter["#t"]).toEqual(["bitcoin", "nostr"]); // undefined removed
            expect(sentFilter["#p"]).toEqual([validPubkey1]); // undefined removed

            sub.stop();
        });

        it("should handle filters that become empty after fixing", async () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                authors: [undefined, undefined], // All undefined
                kinds: [NDKKind.Text],
            };

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, badFilter, {
                subId: "test-sub-fix-empty",
                relaySet,
            });

            sub.start();
            await new Promise((resolve) => setTimeout(resolve, 10));

            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            const sentMessage = JSON.parse(sentMessages[0].message);
            const sentFilter = sentMessage[2];

            // Authors field should be removed entirely when all values are undefined
            expect(sentFilter.authors).toBeUndefined();
            expect(sentFilter.kinds).toEqual([NDKKind.Text]);

            sub.stop();
        });
    });

    describe("Ignore mode (legacy behavior)", () => {
        beforeEach(() => {
            ndk.filterValidationMode = "ignore";
        });

        it("should pass filters with undefined values as-is without throwing", () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                authors: [validPubkey1, undefined, validPubkey2],
                kinds: [NDKKind.Text],
            };

            expect(() => {
                const sub = ndk.subscribe(badFilter);
                sub.stop();
            }).not.toThrow();
        });

        it("should send filters with undefined values to relay (will likely cause issues)", async () => {
            const badFilter: NDKFilter = {
                // @ts-expect-error - Intentionally passing bad data
                authors: [validPubkey1, undefined, validPubkey2],
                kinds: [NDKKind.Text],
            };

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, badFilter, {
                subId: "test-sub-ignore",
                relaySet,
            });

            sub.start();
            await new Promise((resolve) => setTimeout(resolve, 10));

            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            const sentMessage = JSON.parse(sentMessages[0].message);
            const sentFilter = sentMessage[2];

            // In ignore mode, the filter is sent as-is with undefined values
            // Note: JSON.stringify converts undefined to null in arrays
            expect(sentFilter.authors).toEqual([validPubkey1, null, validPubkey2]);

            sub.stop();
        });
    });

    describe("Multiple filters in subscription", () => {
        it("should validate all filters in validate mode", () => {
            ndk.filterValidationMode = "validate";

            const badFilters: NDKFilter[] = [
                {
                    // @ts-expect-error
                    authors: [validPubkey1, undefined],
                    kinds: [NDKKind.Text],
                },
                {
                    authors: [validPubkey2],
                    // @ts-expect-error
                    kinds: [NDKKind.Metadata, undefined],
                },
            ];

            expect(() => {
                ndk.subscribe(badFilters);
            }).toThrow(
                /Filter\[0\]\.authors\[1\] is undefined.*Filter\[1\]\.kinds\[1\] is undefined/s,
            );
        });

        it("should fix all filters in fix mode", async () => {
            ndk.filterValidationMode = "fix";

            const badFilters: NDKFilter[] = [
                {
                    // @ts-expect-error
                    authors: [validPubkey1, undefined],
                    kinds: [NDKKind.Text],
                },
                {
                    authors: [validPubkey2],
                    // @ts-expect-error
                    kinds: [NDKKind.Metadata, undefined],
                },
            ];

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, badFilters, {
                subId: "test-sub-multi-fix",
                relaySet,
            });

            sub.start();
            await new Promise((resolve) => setTimeout(resolve, 10));

            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            const sentMessage = JSON.parse(sentMessages[0].message);

            // Filters are at indices 2 and 3 in the REQ message
            const sentFilter1 = sentMessage[2];
            const sentFilter2 = sentMessage[3];

            expect(sentFilter1.authors).toEqual([validPubkey1]);
            expect(sentFilter2.kinds).toEqual([NDKKind.Metadata]);

            sub.stop();
        });
    });

    describe("Integration with ndk.subscribe()", () => {
        it("should use NDK instance's filterValidationMode setting", () => {
            // Test validate mode
            ndk.filterValidationMode = "validate";
            expect(() => {
                // @ts-expect-error
                ndk.subscribe({ authors: [undefined, validPubkey1] });
            }).toThrow();

            // Test fix mode
            ndk.filterValidationMode = "fix";
            expect(() => {
                const sub = ndk.subscribe({
                    // @ts-expect-error
                    authors: [undefined, validPubkey1],
                });
                sub.stop();
            }).not.toThrow();

            // Test ignore mode
            ndk.filterValidationMode = "ignore";
            expect(() => {
                const sub = ndk.subscribe({
                    // @ts-expect-error
                    authors: [undefined, validPubkey1],
                });
                sub.stop();
            }).not.toThrow();
        });

        it("should work with real-world filter scenarios", async () => {
            ndk.filterValidationMode = "fix";

            // Simulate a real-world scenario where a map operation might return undefined
            const userIds = ["user1", "deleted_user", "user3"];
            const getUserPubkey = (id: string) => {
                if (id === "deleted_user") return undefined;
                // Return valid hex pubkeys
                if (id === "user1")
                    return "0000000000000000000000000000000000000000000000000000000000000004";
                if (id === "user3")
                    return "0000000000000000000000000000000000000000000000000000000000000005";
                return undefined;
            };

            const filter: NDKFilter = {
                // @ts-expect-error - This is what would happen in real code
                authors: userIds.map(getUserPubkey),
                kinds: [NDKKind.Text, NDKKind.Article],
            };

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            const sub = new NDKSubscription(ndk, filter, {
                subId: "real-world-test",
                relaySet,
            });

            sub.start();
            await new Promise((resolve) => setTimeout(resolve, 10));

            const sentMessages = mockRelay.messageLog.filter((m) => m.direction === "out");
            const sentMessage = JSON.parse(sentMessages[0].message);
            const sentFilter = sentMessage[2];

            // Should have removed the undefined value
            expect(sentFilter.authors).toEqual([
                "0000000000000000000000000000000000000000000000000000000000000004",
                "0000000000000000000000000000000000000000000000000000000000000005",
            ]);

            sub.stop();
        });
    });
});
