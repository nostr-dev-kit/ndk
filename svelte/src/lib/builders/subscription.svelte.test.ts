import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createNDK, type NDKSvelte } from "../ndk-svelte.svelte.js";
import { createSubscription } from "./subscription.svelte.js";

describe("Subscription Validation", () => {
    let ndk: NDKSvelte;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        ndk = createNDK({
            explicitRelayUrls: ["wss://relay.test"],
        });
        NDKPrivateKeySigner.generate();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("createSubscription validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, { filters: [{ kinds: [1] }] });
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, { filters: [{ kinds: [1] }] });
            }).toThrow("$subscribe expects config to be a function");
        });

        it("should throw TypeError when passed string", () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, "not a config");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, "not a config");
            }).toThrow("$subscribe expects config to be a function");
        });

        it("should throw TypeError when passed array", () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, [{ kinds: [1] }]);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, null);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                createSubscription(ndk, undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createSubscription(ndk, () => ({
                        filters: [{ kinds: [1] }],
                    }));
                });
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createSubscription(ndk, () => undefined);
                });
            }).not.toThrow();
        });

        it("should accept filter directly without filters wrapper", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createSubscription(ndk, () => ({ kinds: [1], limit: 10 }));
                });
            }).not.toThrow();
        });

        it("should accept array of filters directly", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createSubscription(ndk, () => [
                        { kinds: [1], authors: ["a".repeat(64)] },
                        { kinds: [1], authors: ["b".repeat(64)] }
                    ]);
                });
            }).not.toThrow();
        });
    });

    describe("NDKSvelte.$subscribe validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - testing runtime validation
                ndk.$subscribe({ filters: [{ kinds: [1] }] });
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - testing runtime validation
                ndk.$subscribe({ filters: [{ kinds: [1] }] });
            }).toThrow("$subscribe expects config to be a function");
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    ndk.$subscribe(() => ({
                        filters: [{ kinds: [1] }],
                    }));
                });
            }).not.toThrow();
        });

        it("should accept filter directly without filters wrapper", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    ndk.$subscribe(() => ({ kinds: [1], limit: 10 }));
                });
            }).not.toThrow();
        });

        it("should accept array of filters directly", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    ndk.$subscribe(() => [
                        { kinds: [1], authors: ["a".repeat(64)] },
                        { kinds: [1], authors: ["b".repeat(64)] }
                    ]);
                });
            }).not.toThrow();
        });
    });
});
