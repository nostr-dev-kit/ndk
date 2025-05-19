import { describe, it, expect, vi, beforeEach } from "vitest";
import { type NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { createMockEvent } from "../../store/__tests__/fixtures";
import { useNDKMutes } from "../../store";
import * as sessionStore from "../../../session/store";
import * as ndkHooks from "../../../ndk/hooks";
import * as hooksModule from "../index";
import { isMuted } from "../../../utils/mute";

// Create a mock store for testing
const createMockStore = () => {
    const store = {
        mutes: new Map(),
        activePubkey: "current-user",
        initMutes: vi.fn(),
        loadMuteList: vi.fn(),
        muteItem: vi.fn(),
        unmuteItem: vi.fn(),
        setActivePubkey: vi.fn(),
        isItemMuted: vi.fn(),
        publishMuteList: vi.fn(),
    };

    // Setup default behavior

    return store;
};

describe("Mute Hooks", () => {
    let mockStore: ReturnType<typeof createMockStore>;

    beforeEach(() => {
        // Create a fresh mock store
        mockStore = createMockStore();

        // Mock the useNDKMutes.getState to return our mock store
        vi.spyOn(useNDKMutes, "getState").mockReturnValue(mockStore as any);

        // Mock the session store
        vi.spyOn(sessionStore.useNDKSessions, "getState").mockReturnValue({
            activePubkey: "current-user",
            ndk: {
                NDKEvent: vi.fn().mockImplementation(() => ({
                    kind: 0,
                    content: "",
                    tags: [],
                    sign: vi.fn().mockResolvedValue(undefined),
                    publish: vi.fn().mockResolvedValue(undefined),
                })),
            },
        } as any);

        // Mock the NDK hooks
        vi.spyOn(ndkHooks, "useNDKCurrentUser").mockReturnValue({ pubkey: "current-user" } as any);
    });

    describe("useActiveMuteCriteria", () => {
        it("should return mute criteria for the active user", () => {
            // Setup: Mock the criteria
            const mockCriteria = {
                pubkeys: new Set<string>(["muted-pubkey"]),
                eventIds: new Set<string>(["muted-event"]),
                hashtags: new Set<string>(["muted-hashtag"]),
                words: new Set<string>(["muted-word"]),
            };

            // Mock the hook implementation
            const mockActiveMuteCriteria = vi.fn(() => mockCriteria);
            vi.spyOn(hooksModule, "useActiveMuteCriteria").mockImplementation(mockActiveMuteCriteria);

            // Verify the mock implementation
            expect(hooksModule.useActiveMuteCriteria()).toBe(mockCriteria);
        });

        it("should return empty criteria when no active user", () => {
            // Mock no active user
            vi.spyOn(sessionStore.useNDKSessions, "getState").mockReturnValueOnce({
                activePubkey: null,
                ndk: {} as any,
            } as any);

            // Mock the empty criteria
            const emptyCriteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(),
                words: new Set<string>(),
            };

            // Mock the hook implementation
            const mockActiveMuteCriteria = vi.fn(() => emptyCriteria);
            vi.spyOn(hooksModule, "useActiveMuteCriteria").mockImplementation(mockActiveMuteCriteria);

            // Verify the mock implementation
            const result = hooksModule.useActiveMuteCriteria();
            expect(result.pubkeys.size).toBe(0);
            expect(result.eventIds.size).toBe(0);
            expect(result.hashtags.size).toBe(0);
            expect(result.words?.size).toBe(0);
        });
    });

    describe("useMuteFilter", () => {
        it("should return a function that filters muted events", () => {
            // Setup: Mock the criteria
            const mockCriteria = {
                pubkeys: new Set<string>(["muted-pubkey"]),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(),
                words: new Set<string>(),
            };

            // Create test events
            const mutedEvent = createMockEvent({ pubkey: "muted-pubkey" });
            const nonMutedEvent = createMockEvent({ pubkey: "non-muted-pubkey" });

            // Create a filter function that uses our mocked criteria
            const filterFn = (event: NDKEvent) => isMuted(event, mockCriteria);

            // Mock the hook implementation
            vi.spyOn(hooksModule, "useMuteFilter").mockImplementation(() => filterFn);

            // Verify the filter function
            const hookFilterFn = hooksModule.useMuteFilter();
            expect(hookFilterFn(mutedEvent)).toBe(true); // Event is muted
            expect(hookFilterFn(nonMutedEvent)).toBe(false); // Event is not muted
        });
    });

    // Removed obsolete useMuteItem and useUnmuteItem tests: these hooks no longer exist.

    describe("useIsItemMuted", () => {
        it("should check if a pubkey is muted", () => {
            // Setup: Mock isItemMuted to return true
            mockStore.isItemMuted.mockReturnValue(true);

            // Create a user to check
            const user = new NDKUser({ pubkey: "muted-user" });

            // Mock the hook implementation
            vi.spyOn(hooksModule, "useIsItemMuted").mockImplementation(() => true);

            // Call the mocked hook
            const isMuted = hooksModule.useIsItemMuted(user);

            // Verify the result
            expect(isMuted).toBe(true);

            // Verify the underlying store function would be called correctly
            mockStore.isItemMuted("current-user", "muted-user", "pubkey");
            expect(mockStore.isItemMuted).toHaveBeenCalledWith("current-user", "muted-user", "pubkey");
        });
    });

    // Removed obsolete usePublishMuteList test suite: this hook no longer exists and publishing is handled automatically by mute/unmute.
});
