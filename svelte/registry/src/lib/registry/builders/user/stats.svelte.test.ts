import { NDKEvent, NDKKind, NDKUser } from "@nostr-dev-kit/ndk";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, UserGenerator } from "../../../../test-utils";
import { createUserStats } from "./stats.svelte";

describe("createUserStats", () => {
    let ndk: ReturnType<typeof createTestNDK>;
    let cleanup: (() => void) | undefined;
    let mockSubContactList: { events: NDKEvent[] };
    let mockSubFollowPacks: { events: NDKEvent[] };
    let mockSubRecentNotes: { events: NDKEvent[] };
    let testUser: NDKUser;

    beforeEach(async () => {
        ndk = createTestNDK();

        // Create test user
        const alice = await UserGenerator.getUser("alice", ndk as any);
        testUser = new NDKUser({ pubkey: alice.pubkey });
        testUser.ndk = ndk;

        // Mock subscriptions - return different mocks based on filter
        mockSubContactList = { events: [] };
        mockSubFollowPacks = { events: [] };
        mockSubRecentNotes = { events: [] };

        vi.spyOn(ndk, "$subscribe").mockImplementation((configFn) => {
            const config = (configFn as any)();
            if (!config) return { events: [] } as any;

            const filters = config.filters;
            if (filters && filters[0]) {
                if (filters[0].kinds?.includes(3)) return mockSubContactList as any;
                if (filters[0].kinds?.includes(39089)) return mockSubFollowPacks as any;
                if (filters[0].kinds?.includes(1)) return mockSubRecentNotes as any;
            }
            return { events: [] } as any;
        });

        // Mock $follows
        vi.spyOn(ndk, "$follows", "get").mockReturnValue(new Set() as any);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    describe("initialization", () => {
        it("should initialize with zero counts", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser }), ndk);
            });

            expect(stats!.followCount).toBe(0);
            expect(stats!.followsYou).toBeUndefined();
            expect(stats!.inFollowPackCount).toBe(0);
            expect(stats!.recentNoteCount).toBe(0);
        });

        it("should not subscribe when features are disabled", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            vi.clearAllMocks();

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser }), ndk);
            });

            // Should call $subscribe 3 times (one for each subscription), but return undefined
            expect(ndk.$subscribe).toHaveBeenCalledTimes(3);
        });

        it("should handle undefined config", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createUserStats(() => undefined, ndk);
            });

            expect(stats!.followCount).toBe(0);
            expect(stats!.inFollowPackCount).toBe(0);
            expect(stats!.recentNoteCount).toBe(0);
        });
    });

    describe("followCount computation", () => {
        it("should compute follow count from contact list", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const contactList = new NDKEvent(ndk);
            contactList.kind = 3;
            contactList.pubkey = testUser.pubkey;
            contactList.tags = [
                ["p", "pubkey1"],
                ["p", "pubkey2"],
                ["p", "pubkey3"]
            ];

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, follows: true }), ndk);
            });

            mockSubContactList.events.push(contactList);
            flushSync();

            expect(stats!.followCount).toBe(3);
        });

        it("should return 0 when follows is disabled", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const contactList = new NDKEvent(ndk);
            contactList.kind = 3;
            contactList.pubkey = testUser.pubkey;
            contactList.tags = [["p", "pubkey1"], ["p", "pubkey2"]];

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, follows: false }), ndk);
            });

            mockSubContactList.events.push(contactList);
            flushSync();

            expect(stats!.followCount).toBe(0);
        });

        it("should return 0 when no contact list found", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, follows: true }), ndk);
            });

            expect(stats!.followCount).toBe(0);
        });
    });

    describe("followsYou computation", () => {
        it("should detect when current user follows this user", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const mockFollows = new Set([testUser.pubkey]);
            vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);
            vi.spyOn(ndk, "$activeUser", "get").mockReturnValue({ pubkey: "current-user" } as any);

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser }), ndk);
            });

            expect(stats!.followsYou).toBe(true);
        });

        it("should return false when current user does not follow", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const mockFollows = new Set();
            vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows as any);
            vi.spyOn(ndk, "$activeUser", "get").mockReturnValue({ pubkey: "current-user" } as any);

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser }), ndk);
            });

            expect(stats!.followsYou).toBe(false);
        });

        it("should return undefined when no active user", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            vi.spyOn(ndk, "$activeUser", "get").mockReturnValue(null as any);

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser }), ndk);
            });

            expect(stats!.followsYou).toBeUndefined();
        });
    });

    describe("inFollowPackCount computation", () => {
        it("should count follow packs that include user", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const pack1 = new NDKEvent(ndk);
            pack1.kind = 39089;
            pack1.tags = [["p", testUser.pubkey]];

            const pack2 = new NDKEvent(ndk);
            pack2.kind = 39089;
            pack2.tags = [["p", testUser.pubkey]];

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, followPacks: true }), ndk);
            });

            mockSubFollowPacks.events.push(pack1, pack2);
            flushSync();

            expect(stats!.inFollowPackCount).toBe(2);
        });

        it("should return 0 when followPacks is disabled", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const pack = new NDKEvent(ndk);
            pack.kind = 39089;
            pack.tags = [["p", testUser.pubkey]];

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, followPacks: false }), ndk);
            });

            mockSubFollowPacks.events.push(pack);
            flushSync();

            expect(stats!.inFollowPackCount).toBe(0);
        });
    });

    describe("recentNoteCount computation", () => {
        it("should count recent notes excluding replies", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const note1 = new NDKEvent(ndk);
            note1.kind = NDKKind.Text;
            note1.pubkey = testUser.pubkey;
            note1.tags = []; // Not a reply

            const note2 = new NDKEvent(ndk);
            note2.kind = NDKKind.Text;
            note2.pubkey = testUser.pubkey;
            note2.tags = []; // Not a reply

            const reply = new NDKEvent(ndk);
            reply.kind = NDKKind.Text;
            reply.pubkey = testUser.pubkey;
            reply.tags = [["e", "event-id"]]; // Is a reply

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, recentNotes: true }), ndk);
            });

            mockSubRecentNotes.events.push(note1, note2, reply);
            flushSync();

            expect(stats!.recentNoteCount).toBe(2);
        });

        it("should return 0 when recentNotes is disabled", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            const note = new NDKEvent(ndk);
            note.kind = NDKKind.Text;
            note.pubkey = testUser.pubkey;
            note.tags = [];

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, recentNotes: false }), ndk);
            });

            mockSubRecentNotes.events.push(note);
            flushSync();

            expect(stats!.recentNoteCount).toBe(0);
        });

        it("should subscribe with correct since timestamp (1 week ago)", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser, recentNotes: true }), ndk);
            });

            // Get the subscription call for recent notes
            const calls = (ndk.$subscribe as any).mock.calls;
            const recentNotesCall = calls.find((call: any) => {
                const config = call[0]();
                return config?.filters?.[0]?.kinds?.includes(1);
            });

            expect(recentNotesCall).toBeDefined();
            const config = recentNotesCall[0]();
            const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

            // Allow 1 second tolerance for test execution time
            expect(config.filters[0].since).toBeGreaterThanOrEqual(oneWeekAgo - 1);
            expect(config.filters[0].since).toBeLessThanOrEqual(oneWeekAgo + 1);
        });
    });

    describe("state getters", () => {
        it("should provide read-only getters", () => {
            let stats: ReturnType<typeof createUserStats> | undefined;

            cleanup = $effect.root(() => {
                stats = createUserStats(() => ({ user: testUser }), ndk);
            });

            expect(typeof Object.getOwnPropertyDescriptor(stats!, 'followCount')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(stats!, 'followsYou')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(stats!, 'inFollowPackCount')?.get).toBe('function');
            expect(typeof Object.getOwnPropertyDescriptor(stats!, 'recentNoteCount')?.get).toBe('function');
        });
    });
});
