import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createNDK } from "./ndk-svelte.svelte.js";
import { createFetchProfile } from "./profile.svelte.js";

describe("Profile Validation", () => {
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

    describe("createFetchProfile validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchProfile(ndk, "hexPubkey");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchProfile(ndk, "hexPubkey");
            }).toThrow("$fetchProfile expects pubkey to be a function");
        });

        it("should throw TypeError when passed object", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchProfile(ndk, { pubkey: "hex" });
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchProfile(ndk, null);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                createFetchProfile(ndk, undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createFetchProfile(ndk, () => "hexPubkey");
                });
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createFetchProfile(ndk, () => undefined);
                });
            }).not.toThrow();
        });
    });
});
