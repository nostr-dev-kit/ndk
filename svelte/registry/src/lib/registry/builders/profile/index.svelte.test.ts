import { NDKUser } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestNDK } from "../../../../test-utils";
import { createProfileFetcher } from "./index.svelte";

describe("createProfileFetcher", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        ndk = createTestNDK();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with null state when user is not provided", () => {
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: null }), ndk);
            });

            expect(profileFetcher!.profile).toBeNull();
            expect(profileFetcher!.user).toBeNull();
            expect(profileFetcher!.loading).toBe(false);
        });

        it("should handle undefined user", () => {
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: undefined }), ndk);
            });

            expect(profileFetcher!.profile).toBeNull();
            expect(profileFetcher!.user).toBeNull();
            expect(profileFetcher!.loading).toBe(false);
        });

        it("should handle empty string user", () => {
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: "" }), ndk);
            });

            expect(profileFetcher!.profile).toBeNull();
            expect(profileFetcher!.user).toBeNull();
            expect(profileFetcher!.loading).toBe(false);
        });
    });

    describe("reactive user updates", () => {
        it("should reset state when user becomes null", () => {
            let currentUser = $state<NDKUser | null>(null);
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: currentUser }), ndk);
            });

            expect(profileFetcher!.profile).toBeNull();
            expect(profileFetcher!.loading).toBe(false);

            // Change to null explicitly
            currentUser = null;
            flushSync();

            expect(profileFetcher!.profile).toBeNull();
            expect(profileFetcher!.user).toBeNull();
            expect(profileFetcher!.loading).toBe(false);
        });

        it("should reset state when user becomes undefined", () => {
            let currentUser = $state<NDKUser | null | undefined>(null);
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: currentUser }), ndk);
            });

            // Change to undefined
            currentUser = undefined;
            flushSync();

            expect(profileFetcher!.profile).toBeNull();
            expect(profileFetcher!.user).toBeNull();
            expect(profileFetcher!.loading).toBe(false);
        });
    });

    describe("state getters", () => {
        it("should provide read-only profile getter", () => {
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: null }), ndk);
            });

            // Should be able to read profile
            const profile = profileFetcher!.profile;
            expect(profile).toBeNull();

            // profile should be a getter (read-only)
            expect(typeof Object.getOwnPropertyDescriptor(profileFetcher!, 'profile')?.get).toBe('function');
        });

        it("should provide read-only user getter", () => {
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: null }), ndk);
            });

            // Should be able to read user
            const user = profileFetcher!.user;
            expect(user).toBeNull();

            // user should be a getter (read-only)
            expect(typeof Object.getOwnPropertyDescriptor(profileFetcher!, 'user')?.get).toBe('function');
        });

        it("should provide read-only loading getter", () => {
            let profileFetcher: ReturnType<typeof createProfileFetcher> | undefined;

            cleanup = $effect.root(() => {
                profileFetcher = createProfileFetcher(() => ({ user: null }), ndk);
            });

            // Should be able to read loading
            const loading = profileFetcher!.loading;
            expect(loading).toBe(false);

            // loading should be a getter (read-only)
            expect(typeof Object.getOwnPropertyDescriptor(profileFetcher!, 'loading')?.get).toBe('function');
        });
    });
});
