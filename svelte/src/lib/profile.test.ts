import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { NDKSvelte } from "./ndk-svelte.svelte.js";
import { createFetchProfile } from "./profile.svelte.js";

describe("Profile Validation", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte({
            explicitRelayUrls: ["wss://relay.test"],
        });
        NDKPrivateKeySigner.generate();
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
                createFetchProfile(ndk, () => "hexPubkey");
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                createFetchProfile(ndk, () => undefined);
            }).not.toThrow();
        });
    });

    describe("NDKSvelte.$fetchProfile validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                ndk.$fetchProfile("hexPubkey");
            }).toThrow(TypeError);
            expect(() => {
                // @ts-expect-error - Testing runtime validation
                ndk.$fetchProfile("hexPubkey");
            }).toThrow("$fetchProfile expects pubkey to be a function");
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                ndk.$fetchProfile(() => "hexPubkey");
            }).not.toThrow();
        });
    });
});
