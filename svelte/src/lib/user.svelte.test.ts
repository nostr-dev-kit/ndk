import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createNDK, type NDKSvelte } from "./ndk-svelte.svelte.js";
import { createFetchUser, createZapInfo } from "./user.svelte.js";

describe("User Validation", () => {
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

    describe("createFetchUser validation", () => {
        it("should throw TypeError when passed non-function", () => {
            expect(() => {
                createFetchUser(ndk, () => "npub1test");
            }).toThrow(TypeError);
            expect(() => {
                createFetchUser(ndk, () => "npub1test");
            }).toThrow("$fetchUser expects identifier to be a function");
        });

        it("should throw TypeError when passed object", () => {
            expect(() => {
                createFetchUser(ndk, () => ({ npub: "npub1test" }) as any);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                createFetchUser(ndk, () => null as any);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                createFetchUser(ndk, () => undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createFetchUser(ndk, () => "npub1test");
                });
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createFetchUser(ndk, () => undefined);
                });
            }).not.toThrow();
        });
    });

    describe("createZapInfo validation", () => {
        it("should throw TypeError when passed non-function", () => {
            const user = ndk.getUser({ npub: "npub1test" });
            expect(() => {
                createZapInfo(() => user);
            }).toThrow(TypeError);
            expect(() => {
                createZapInfo(() => user);
            }).toThrow("createZapInfo expects user to be a function");
        });

        it("should throw TypeError when passed string", () => {
            expect(() => {
                createZapInfo(() => "npub1test" as any);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed null", () => {
            expect(() => {
                createZapInfo(() => null as any);
            }).toThrow(TypeError);
        });

        it("should throw TypeError when passed undefined", () => {
            expect(() => {
                createZapInfo(() => undefined);
            }).toThrow(TypeError);
        });

        it("should not throw when passed a function", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createZapInfo(() => ndk.getUser({ npub: "npub1test" }));
                });
            }).not.toThrow();
        });

        it("should not throw when function returns undefined", () => {
            expect(() => {
                cleanup = $effect.root(() => {
                    createZapInfo(() => undefined);
                });
            }).not.toThrow();
        });
    });
});
