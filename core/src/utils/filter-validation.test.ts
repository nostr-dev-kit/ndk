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
            }).toThrow(/Filter\[0\]\.authors\[1\] is undefined.*Filter\[1\]\.kinds\[1\] is undefined/s);
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
                if (id === "user1") return "0000000000000000000000000000000000000000000000000000000000000004";
                if (id === "user3") return "0000000000000000000000000000000000000000000000000000000000000005";
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

    describe("AI Guardrails - Bech32 in filter arrays", () => {
        beforeEach(() => {
            // Enable AI guardrails for these tests
            ndk = new NDK({
                explicitRelayUrls: ["wss://relay.test.com"],
                filterValidationMode: "validate",
                aiGuardrails: true,
            });

            // @ts-expect-error - We're intentionally replacing the pool for testing
            ndk.pool = pool;
            mockRelay = pool.addMockRelay("wss://relay.test.com");
        });

        describe("bech32 in ids array", () => {
            it("should throw fatal error when ids contains note1 bech32", () => {
                const badFilter: NDKFilter = {
                    ids: ["note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsq8l0j"],
                    kinds: [1],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/ids\[0\] contains bech32/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/Use filterFromId\(\)/);
            });

            it("should throw fatal error when ids contains nevent1 bech32", () => {
                const badFilter: NDKFilter = {
                    ids: ["nevent1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqs9p2gz3"],
                    kinds: [1],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/ids\[0\] contains bech32/);
            });

            it("should fall back to standard validation when trying to skip the check", () => {
                // Reinitialize with skip set
                ndk = new NDK({
                    explicitRelayUrls: ["wss://relay.test.com"],
                    filterValidationMode: "validate",
                    aiGuardrails: {
                        skip: new Set(["filter-bech32-in-array"]),
                    },
                });

                // @ts-expect-error
                ndk.pool = pool;

                const badFilter: NDKFilter = {
                    ids: ["note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsq8l0j"],
                    kinds: [1],
                };

                // Should still throw, but from standard filter validation (not AI guardrails)
                // because bech32 is not a valid 64-char hex string
                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/Invalid filter\(s\) detected/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/is not a valid 64-char hex string/);
            });

            it("should allow valid hex ids", () => {
                const goodFilter: NDKFilter = {
                    ids: [validEventId1, validEventId2],
                    kinds: [1],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });
        });

        describe("bech32 in authors array", () => {
            it("should throw fatal error when authors contains npub bech32", () => {
                const badFilter: NDKFilter = {
                    authors: ["npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwv37l"],
                    kinds: [1],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/authors\[0\] contains bech32/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/Use ndkUser\.pubkey instead/);
            });

            it("should throw fatal error when authors contains nprofile bech32", () => {
                const badFilter: NDKFilter = {
                    authors: ["nprofile1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqs0enayy"],
                    kinds: [1],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/authors\[0\] contains bech32/);
            });

            it("should throw fatal error for multiple authors with one being bech32", () => {
                const badFilter: NDKFilter = {
                    authors: [
                        validPubkey1,
                        "npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwv37l",
                        validPubkey2,
                    ],
                    kinds: [1],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/authors\[1\] contains bech32/);
            });

            it("should allow valid hex pubkeys", () => {
                const goodFilter: NDKFilter = {
                    authors: [validPubkey1, validPubkey2, validPubkey3],
                    kinds: [1],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });
        });

        describe("bech32 in tag filters", () => {
            it("should throw fatal error when #e tag contains note1 bech32", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#e": ["note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsq8l0j"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#e\[0\] contains bech32/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/Use filterFromId\(\) or nip19\.decode\(\)/);
            });

            it("should throw fatal error when #p tag contains npub bech32", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#p": ["npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwv37l"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#p\[0\] contains bech32/);
            });

            it("should throw fatal error for naddr in #a tag filter", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["naddr1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsdtpwtk"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#a\[0\] has invalid format/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/Must be "kind:pubkey:d-tag"/);
            });

            it("should throw fatal error for non-addressable kind in #a tag filter", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["20:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:undefined"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#a\[0\] uses non-addressable kind 20/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#a filters are only for addressable events \(kinds 30000-39999\)/);
            });

            it("should throw for kind 1 in #a tag", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["1:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:test"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/uses non-addressable kind 1/);
            });

            it("should throw for kind 29999 (just below addressable range) in #a tag", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["29999:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:test"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/uses non-addressable kind 29999/);
            });

            it("should throw for kind 40000 (just above addressable range) in #a tag", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["40000:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:test"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/uses non-addressable kind 40000/);
            });

            it("should allow valid addressable kind 30000 in #a tag", () => {
                const goodFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["30000:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:test"],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });

            it("should allow valid addressable kind 30023 (article) in #a tag", () => {
                const goodFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["30023:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:my-article"],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });

            it("should allow valid addressable kind 39999 (max range) in #a tag", () => {
                const goodFilter: NDKFilter = {
                    kinds: [1],
                    "#a": ["39999:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:test"],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });

            it("should allow valid hex values in #e and #p tags", () => {
                const goodFilter: NDKFilter = {
                    kinds: [1],
                    "#e": [validEventId1, validEventId2],
                    "#p": [validPubkey1, validPubkey2],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });

            it("should allow non-hex strings in custom tag filters", () => {
                const goodFilter: NDKFilter = {
                    kinds: [1],
                    "#t": ["bitcoin", "nostr", "programming"],
                    "#d": ["my-article-identifier"],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });
        });

        describe("all bech32 formats", () => {
            const bech32Formats = [
                { prefix: "note1", description: "note (event ID)" },
                { prefix: "npub1", description: "npub (public key)" },
                { prefix: "naddr1", description: "naddr (addressable event)" },
                { prefix: "nevent1", description: "nevent (event with relay hints)" },
                { prefix: "nprofile1", description: "nprofile (profile with relay hints)" },
            ];

            bech32Formats.forEach(({ prefix, description }) => {
                it(`should detect and reject ${description}`, () => {
                    const badFilter: NDKFilter = {
                        authors: [`${prefix}qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`],
                        kinds: [1],
                    };

                    expect(() => {
                        ndk.subscribe(badFilter);
                    }).toThrow(/AI_GUARDRAILS/);

                    expect(() => {
                        ndk.subscribe(badFilter);
                    }).toThrow(/contains bech32/);
                });
            });
        });

        describe("hashtag filters with # prefix", () => {
            it("should throw fatal error when #t filter contains hashtag with # prefix", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#t": ["#nostr"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#t\[0\] contains hashtag with # prefix/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/"#nostr"/);
            });

            it("should throw fatal error for multiple hashtags with # prefix", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#t": ["#bitcoin", "#nostr", "programming"],
                };

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/AI_GUARDRAILS/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/#t\[0\] contains hashtag with # prefix/);

                expect(() => {
                    ndk.subscribe(badFilter);
                }).toThrow(/"#bitcoin"/);
            });

            it("should allow valid hashtags without # prefix", () => {
                const goodFilter: NDKFilter = {
                    kinds: [1],
                    "#t": ["bitcoin", "nostr", "programming"],
                };

                expect(() => {
                    const sub = ndk.subscribe(goodFilter);
                    sub.stop();
                }).not.toThrow();
            });

            it("should provide helpful hint about removing # prefix", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#t": ["#nostr"],
                };

                try {
                    ndk.subscribe(badFilter);
                    expect.fail("Should have thrown");
                } catch (error: any) {
                    expect(error.message).toContain("Remove the # prefix from hashtag filters");
                    expect(error.message).toContain('✅ { "#t": ["nostr"] }');
                    expect(error.message).toContain('❌ { "#t": ["#nostr"] }');
                }
            });
        });

        describe("error messages and hints", () => {
            it("should provide helpful hint for ids with bech32", () => {
                const badFilter: NDKFilter = {
                    ids: ["note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsq8l0j"],
                    kinds: [1],
                };

                try {
                    ndk.subscribe(badFilter);
                    expect.fail("Should have thrown");
                } catch (error: any) {
                    expect(error.message).toContain("IDs must be hex, not bech32");
                    expect(error.message).toContain("Use filterFromId() to decode bech32 first");
                    expect(error.message).toContain('@nostr-dev-kit/ndk"');
                }
            });

            it("should provide helpful hint for authors with bech32", () => {
                const badFilter: NDKFilter = {
                    authors: ["npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwv37l"],
                    kinds: [1],
                };

                try {
                    ndk.subscribe(badFilter);
                    expect.fail("Should have thrown");
                } catch (error: any) {
                    expect(error.message).toContain("Authors must be hex pubkeys, not npub");
                    expect(error.message).toContain("Use ndkUser.pubkey instead");
                    expect(error.message).toContain("{ authors: [ndkUser.pubkey] }");
                }
            });

            it("should provide helpful hint for tag filters with bech32", () => {
                const badFilter: NDKFilter = {
                    kinds: [1],
                    "#e": ["note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsq8l0j"],
                };

                try {
                    ndk.subscribe(badFilter);
                    expect.fail("Should have thrown");
                } catch (error: any) {
                    expect(error.message).toContain("Tag values must be decoded");
                    expect(error.message).toContain("Use filterFromId() or nip19.decode()");
                }
            });

            it("should catch invalid pubkeys from kind:3 follow lists", () => {
                const badFilter: NDKFilter = {
                    authors: [
                        validPubkey1,
                        "Follow List", // Invalid entry from corrupted follow list
                        validPubkey2,
                        "highlig", // Another invalid entry
                    ],
                    kinds: [1],
                };

                try {
                    ndk.subscribe(badFilter);
                    expect.fail("Should have thrown");
                } catch (error: any) {
                    expect(error.message).toContain("AI_GUARDRAILS ERROR");
                    expect(error.message).toContain("is not a valid 64-char hex pubkey");
                    expect(error.message).toContain('"Follow List"');
                    expect(error.message).toContain("Kind:3 follow lists can contain invalid entries");
                    expect(error.message).toContain('labels ("Follow List")');
                    expect(error.message).toContain('partial strings ("highlig")');
                    expect(error.message).toContain("You MUST validate all pubkeys");
                    expect(error.message).toContain(
                        "const validPubkeys = pubkeys.filter(p => /^[0-9a-f]{64}$/i.test(p));",
                    );
                }
            });
        });

        describe("multiple bech32 errors in one filter", () => {
            it("should throw on first bech32 error encountered (ids checked first)", () => {
                const badFilter: NDKFilter = {
                    ids: ["note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsq8l0j"],
                    authors: ["npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwv37l"],
                    "#e": ["nevent1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqs9p2gz3"],
                    kinds: [1],
                };

                try {
                    ndk.subscribe(badFilter);
                    expect.fail("Should have thrown");
                } catch (error: any) {
                    // Guardrails throw on first error, so we only see the ids error
                    expect(error.message).toContain("ids[0] contains bech32");
                    expect(error.message).toContain("AI_GUARDRAILS ERROR");
                }
            });
        });
    });
});
