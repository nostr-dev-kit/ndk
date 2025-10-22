import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKSvelte } from "./ndk-svelte.svelte.js";
import { createFetchUser, useZapInfo } from "./user.svelte.js";

describe("User Validation", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte({
            explicitRelayUrls: ["wss://relay.test"],
        });
        NDKPrivateKeySigner.generate();
    });

    describe("createFetchUser validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchUser(ndk, "npub1test");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchUser(ndk, "npub1test");
            }).toThrow("$fetchUser expects identifier to be a function");
        });

        it("should throw TypeError when passed object", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchUser(ndk, { npub: "npub1test" });
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchUser(ndk, null);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchUser(ndk, undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                createFetchUser(ndk, () => "npub1test");
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                createFetchUser(ndk, () => undefined);
            }).not.toThrow();
        });
    });

    describe("NDKSvelte.$fetchUser validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                ndk.$fetchUser("npub1test");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                ndk.$fetchUser("npub1test");
            }).toThrow("$fetchUser expects identifier to be a function");
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                ndk.$fetchUser(() => "npub1test");
            }).not.toThrow();
        });
    });

    describe("useZapInfo validation", () => {
        it("should throw TypeError when passed non-function", () => {
            const user = ndk.getUser({ npub: "npub1test" });
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                useZapInfo(user);
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                useZapInfo(user);
            }).toThrow("useZapInfo expects user to be a function");
        });

        it("should throw TypeError when passed string", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                useZapInfo("npub1test");
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                useZapInfo(null);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                useZapInfo(undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                useZapInfo(() => ndk.getUser({ npub: "npub1test" }));
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                useZapInfo(() => undefined);
            }).not.toThrow();
        });
    });
});
