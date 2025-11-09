import { NDKInterestList, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, UserGenerator } from "../../../../test-utils";
import { createFollowAction } from "./index.svelte";

describe("createFollowAction", () => {
    let ndk;
    let cleanup: (() => void) | undefined;
    let alice: NDKUser;
    let bob: NDKUser;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
        vi.restoreAllMocks();
    });

    describe("user follows", () => {
        describe("initialization", () => {
            it("should initialize with isFollowing false when not following", () => {
                const mockFollows = {
                    has: vi.fn().mockReturnValue(false),
                    add: vi.fn(),
                    remove: vi.fn(),
                };
                vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: bob }), ndk);
                });

                expect(followAction.isFollowing).toBe(false);
            });

            it("should initialize with isFollowing true when already following", () => {
                const mockFollows = {
                    has: vi.fn().mockReturnValue(true),
                    add: vi.fn(),
                    remove: vi.fn(),
                };
                vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: bob }), ndk);
                });

                expect(followAction.isFollowing).toBe(true);
            });

            it("should return false when target is undefined", () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: undefined }), ndk);
                });

                expect(followAction.isFollowing).toBe(false);
            });

            it("should handle user without pubkey gracefully", () => {
                const invalidUser = new NDKUser({ npub: "invalid" });
                // Don't set pubkey - accessing it will throw

                const mockFollows = {
                    has: vi.fn().mockReturnValue(false),
                };
                vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: invalidUser }), ndk);
                });

                expect(followAction.isFollowing).toBe(false);
            });
        });

        describe("follow() function for users", () => {
            it("should add user to follows when not following", async () => {
                const mockFollows = {
                    has: vi.fn().mockReturnValue(false),
                    add: vi.fn().mockResolvedValue(undefined),
                    remove: vi.fn(),
                };
                vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: bob }), ndk);
                });

                await followAction.follow();

                expect(mockFollows.add).toHaveBeenCalledWith(bob.pubkey);
                expect(mockFollows.remove).not.toHaveBeenCalled();
            });

            it("should remove user from follows when already following", async () => {
                const mockFollows = {
                    has: vi.fn().mockReturnValue(true),
                    add: vi.fn(),
                    remove: vi.fn().mockResolvedValue(undefined),
                };
                vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: bob }), ndk);
                });

                await followAction.follow();

                expect(mockFollows.remove).toHaveBeenCalledWith(bob.pubkey);
                expect(mockFollows.add).not.toHaveBeenCalled();
            });

            it("should do nothing when target is undefined", async () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: undefined }), ndk);
                });

                await followAction.follow();
                // Should not throw
            });

            it("should throw error when user not loaded yet (no pubkey)", async () => {
                const invalidUser = new NDKUser({ npub: "invalid" });

                const mockFollows = {
                    has: vi.fn().mockReturnValue(false),
                };
                vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: invalidUser }), ndk);
                });

                await expect(followAction.follow()).rejects.toThrow("User not loaded yet");
            });
        });
    });

    describe("hashtag follows", () => {
        let mockInterestList: any;
        let mockSessions;

        beforeEach(() => {
            const interests = new Set<string>();

            mockInterestList = {
                interests,
                hasInterest: vi.fn((hashtag: string) => interests.has(hashtag)),
                addInterest: vi.fn((hashtag: string) => {
                    interests.add(hashtag);
                }),
                removeInterest: vi.fn((hashtag: string) => {
                    interests.delete(hashtag);
                }),
                publishReplaceable: vi.fn().mockResolvedValue(new Set()),
            } as any;

            mockSessions = {
                addMonitor: vi.fn(),
            };
            vi.spyOn(ndk, "$sessions", "get").mockReturnValue(mockSessions as any);
            vi.spyOn(ndk, "$sessionEvent").mockReturnValue(mockInterestList);
        });

        describe("initialization", () => {
            it("should add interest list monitor on creation", () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                expect(mockSessions.addMonitor).toHaveBeenCalledWith([NDKInterestList]);
            });

            it("should return false for hashtag not in interest list", () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                expect(followAction.isFollowing).toBe(false);
            });

            it("should return true for hashtag in interest list", () => {
                mockInterestList.interests.add("bitcoin");

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                expect(followAction.isFollowing).toBe(true);
            });

            it("should normalize hashtags to lowercase", () => {
                mockInterestList.interests.add("bitcoin");

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "BITCOIN" }), ndk);
                });

                expect(followAction.isFollowing).toBe(true);
            });

            it("should return false when interest list is not available", () => {
                vi.spyOn(ndk, "$sessionEvent").mockReturnValue(undefined);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                expect(followAction.isFollowing).toBe(false);
            });
        });

        describe("follow() function for hashtags", () => {
            it("should add hashtag to interest list when not following", async () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                await followAction.follow();

                expect(mockInterestList.addInterest).toHaveBeenCalledWith("bitcoin");
                expect(mockInterestList.publishReplaceable).toHaveBeenCalled();
            });

            it("should remove hashtag from interest list when already following", async () => {
                mockInterestList.interests.add("bitcoin");

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                await followAction.follow();

                expect(mockInterestList.removeInterest).toHaveBeenCalledWith("bitcoin");
                expect(mockInterestList.publishReplaceable).toHaveBeenCalled();
            });

            it("should normalize hashtag to lowercase before adding", async () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "BITCOIN" }), ndk);
                });

                await followAction.follow();

                expect(mockInterestList.addInterest).toHaveBeenCalledWith("bitcoin");
            });

            it("should do nothing when interest list is not available", async () => {
                vi.spyOn(ndk, "$sessionEvent").mockReturnValue(undefined);

                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: "bitcoin" }), ndk);
                });

                await followAction.follow();

                // Should not throw, just return early
                expect(mockInterestList.addInterest).not.toHaveBeenCalled();
            });

            it("should do nothing when target is undefined", async () => {
                let followAction;
                cleanup = $effect.root(() => {
                    followAction = createFollowAction(() => ({ target: undefined }), ndk);
                });

                await followAction.follow();

                expect(mockInterestList.addInterest).not.toHaveBeenCalled();
                expect(mockInterestList.removeInterest).not.toHaveBeenCalled();
            });
        });
    });

    describe("without sessions", () => {
        it("should work when $sessions is not available", () => {
            vi.spyOn(ndk, "$sessions", "get").mockReturnValue(undefined as any);

            const mockFollows = {
                has: vi.fn().mockReturnValue(false),
            };
            vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);

            let followAction;
            cleanup = $effect.root(() => {
                followAction = createFollowAction(() => ({ target: bob }), ndk);
            });

            // Should not throw
            expect(followAction.isFollowing).toBe(false);
        });
    });
});
