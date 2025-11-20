import { describe, expect, it, vi, beforeEach } from "vitest";
import { FollowsProxy } from "./follows.svelte.js";
import type { ReactiveSessionsStore } from "./sessions.svelte.js";
import type { NDKRelay } from "@nostr-dev-kit/ndk";

describe("FollowsProxy", () => {
    let mockStore: ReactiveSessionsStore;
    let followSet: Set<string>;
    let followsProxy: FollowsProxy;
    let mockUser: any;

    beforeEach(() => {
        followSet = new Set(["pubkey1", "pubkey2"]);

        mockUser = {
            follow: vi.fn().mockResolvedValue(true),
            unfollow: vi.fn().mockResolvedValue(new Set()),
        };

        mockStore = {
            get currentUser() {
                return mockUser;
            }
        } as ReactiveSessionsStore;

        followsProxy = new FollowsProxy(mockStore, followSet);
    });

    describe("constructor", () => {
        it("should initialize with store and followSet", () => {
            expect(followsProxy).toBeDefined();
            expect(followsProxy.size).toBe(2);
            expect(followsProxy.has("pubkey1")).toBe(true);
            expect(followsProxy.has("pubkey2")).toBe(true);
        });
    });

    describe("add method", () => {
        it("should throw error when no active user", async () => {
            mockStore = {
                get currentUser() {
                    return undefined;
                }
            } as Partial<ReactiveSessionsStore> as ReactiveSessionsStore;

            followsProxy = new FollowsProxy(mockStore, followSet);

            await expect(followsProxy.add("pubkey3")).rejects.toThrow("No active user");
        });

        it("should call user.follow with pubkey and followSet", async () => {
            await followsProxy.add("pubkey3");

            expect(mockUser.follow).toHaveBeenCalledWith("pubkey3", followSet);
        });

        it("should return true when follow is added", async () => {
            mockUser.follow.mockResolvedValue(true);

            const result = await followsProxy.add("pubkey3");

            expect(result).toBe(true);
        });

        it("should return false when already following", async () => {
            mockUser.follow.mockResolvedValue(false);

            const result = await followsProxy.add("pubkey1");

            expect(result).toBe(false);
        });
    });

    describe("remove method", () => {
        it("should throw error when no active user", async () => {
            mockStore = {
                get currentUser() {
                    return undefined;
                }
            } as Partial<ReactiveSessionsStore> as ReactiveSessionsStore;

            followsProxy = new FollowsProxy(mockStore, followSet);

            await expect(followsProxy.remove("pubkey1")).rejects.toThrow("No active user");
        });

        it("should call user.unfollow with pubkey and followSet", async () => {
            await followsProxy.remove("pubkey1");

            expect(mockUser.unfollow).toHaveBeenCalledWith("pubkey1", followSet);
        });

        it("should return relays when unfollowed successfully", async () => {
            const mockRelays = new Set<NDKRelay>();
            mockUser.unfollow.mockResolvedValue(mockRelays);

            const result = await followsProxy.remove("pubkey1");

            expect(result).toBe(mockRelays);
        });

        it("should return false when not following", async () => {
            mockUser.unfollow.mockResolvedValue(false);

            const result = await followsProxy.remove("pubkey3");

            expect(result).toBe(false);
        });
    });

    describe("toggle method", () => {
        it("should call remove when already following", async () => {
            const removeSpy = vi.spyOn(followsProxy, "remove");

            await followsProxy.toggle("pubkey1");

            expect(removeSpy).toHaveBeenCalledWith("pubkey1");
        });

        it("should call add when not following", async () => {
            const addSpy = vi.spyOn(followsProxy, "add");

            await followsProxy.toggle("pubkey3");

            expect(addSpy).toHaveBeenCalledWith("pubkey3");
        });
    });

    describe("Set delegation methods", () => {
        it("has() should delegate to underlying Set", () => {
            expect(followsProxy.has("pubkey1")).toBe(true);
            expect(followsProxy.has("pubkey3")).toBe(false);
        });

        it("size should return underlying Set size", () => {
            expect(followsProxy.size).toBe(2);

            followSet.add("pubkey3");
            expect(followsProxy.size).toBe(3);
        });

        it("iterator should delegate to underlying Set", () => {
            const values = Array.from(followsProxy);
            expect(values).toContain("pubkey1");
            expect(values).toContain("pubkey2");
            expect(values).toHaveLength(2);
        });

        it("values() should delegate to underlying Set", () => {
            const values = Array.from(followsProxy.values());
            expect(values).toContain("pubkey1");
            expect(values).toContain("pubkey2");
            expect(values).toHaveLength(2);
        });

        it("keys() should delegate to underlying Set", () => {
            const keys = Array.from(followsProxy.keys());
            expect(keys).toContain("pubkey1");
            expect(keys).toContain("pubkey2");
            expect(keys).toHaveLength(2);
        });

        it("entries() should delegate to underlying Set", () => {
            const entries = Array.from(followsProxy.entries());
            expect(entries).toContainEqual(["pubkey1", "pubkey1"]);
            expect(entries).toContainEqual(["pubkey2", "pubkey2"]);
            expect(entries).toHaveLength(2);
        });

        it("forEach should delegate to underlying Set", () => {
            const callback = vi.fn();

            followsProxy.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith("pubkey1", "pubkey1", followSet);
            expect(callback).toHaveBeenCalledWith("pubkey2", "pubkey2", followSet);
        });

        it("forEach should support thisArg", () => {
            const thisArg = { count: 0 };
            const callback = function(this: any) {
                this.count++;
            };

            followsProxy.forEach(callback, thisArg);

            expect(thisArg.count).toBe(2);
        });
    });
});
