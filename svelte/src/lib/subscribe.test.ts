import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKSvelte } from "./ndk-svelte.svelte.js";
import { createSubscription } from "./subscribe.svelte.js";

describe("Subscription Validation", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte({
            explicitRelayUrls: ["wss://relay.test"],
        });
        NDKPrivateKeySigner.generate();
    });

    describe("createSubscription validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, { filters: [{ kinds: [1] }] });
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, { filters: [{ kinds: [1] }] });
            }).toThrow("$subscribe expects config to be a function");
        });

        it("should throw TypeError when passed string", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, "not a config");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, "not a config");
            }).toThrow("$subscribe expects config to be a function");
        });

        it("should throw TypeError when passed array", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, [{ kinds: [1] }]);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, null);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createSubscription(ndk, undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                createSubscription(ndk, () => ({
                    filters: [{ kinds: [1] }],
                }));
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                createSubscription(ndk, () => undefined);
            }).not.toThrow();
        });

        it("should accept filter directly without filters wrapper", () => {
            expect(() => {
                createSubscription(ndk, () => ({ kinds: [1], limit: 10 }));
            }).not.toThrow();
        });

        it("should accept array of filters directly", () => {
            expect(() => {
                createSubscription(ndk, () => [
                    { kinds: [1], authors: ["pubkey1"] },
                    { kinds: [1], authors: ["pubkey2"] }
                ]);
            }).not.toThrow();
        });
    });

    describe("NDKSvelte.$subscribe validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                ndk.$subscribe({ filters: [{ kinds: [1] }] });
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                ndk.$subscribe({ filters: [{ kinds: [1] }] });
            }).toThrow("$subscribe expects config to be a function");
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                ndk.$subscribe(() => ({
                    filters: [{ kinds: [1] }],
                }));
            }).not.toThrow();
        });

        it("should accept filter directly without filters wrapper", () => {
            expect(() => {
                ndk.$subscribe(() => ({ kinds: [1], limit: 10 }));
            }).not.toThrow();
        });

        it("should accept array of filters directly", () => {
            expect(() => {
                ndk.$subscribe(() => [
                    { kinds: [1], authors: ["pubkey1"] },
                    { kinds: [1], authors: ["pubkey2"] }
                ]);
            }).not.toThrow();
        });
    });
});
