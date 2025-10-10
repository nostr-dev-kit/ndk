/// <reference types="vitest" />
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockSessionStorageAdapter } from "../../storage/__tests__/mock-storage-adapter";
import { useNDKSessionMonitor } from "../use-ndk-session-monitor";

// Mock NDK and related objects
const mockNDK = {
    getUser: vi.fn((params) => ({ pubkey: params.pubkey })),
};

// Mock hooks return values
let mockCurrentUser: { pubkey: string } | null = null;
let mockAddSession = vi.fn();
let mockSessions = new Map();
let mockSigners = new Map();
let mockStartSession = vi.fn();
let mockStopSession = vi.fn();

// Mock the hooks that useNDKSessionMonitor depends on
vi.mock("../../../ndk/hooks", () => {
    return {
        useNDK: () => ({ ndk: mockNDK }),
        useNDKCurrentUser: () => mockCurrentUser,
        useNDKCurrentPubkey: () => mockCurrentUser?.pubkey || null,
    };
});

vi.mock("../index", () => {
    return {
        useNDKSessionLogin: () => mockAddSession,
    };
});

vi.mock("../sessions", () => {
    return {
        useNDKSessionSessions: () => mockSessions,
    };
});

vi.mock("../signers", () => {
    return {
        useNDKSessionSigners: () => mockSigners,
    };
});

vi.mock("../control", () => {
    return {
        useNDKSessionStart: () => mockStartSession,
        useNDKSessionStop: () => mockStopSession,
    };
});

// Mock the session store
vi.mock("../../store", () => {
    return {
        useNDKSessions: (selector) => {
            if (typeof selector === "function") {
                return selector({
                    activePubkey: mockCurrentUser?.pubkey || null,
                    sessions: mockSessions,
                });
            }
            return {
                getState: () => ({
                    addSession: mockAddSession,
                    removeSession: vi.fn(),
                    switchToUser: vi.fn(),
                }),
            };
        },
    };
});

// Mock for ndkSignerFromPayload
vi.mock("@nostr-dev-kit/ndk", () => {
    return {
        NDKUser: class NDKUser {
            pubkey: string;
            constructor({ pubkey }: { pubkey: string }) {
                this.pubkey = pubkey;
            }
        },
        ndkSignerFromPayload: async (payload: string, ndk: unknown) => {
            if (payload === "valid-payload") {
                return {
                    user: () => Promise.resolve({ pubkey: "test-pubkey" }),
                    toPayload: () => "valid-payload",
                    getPublicKey: () => Promise.resolve("test-pubkey"),
                };
            }
            return null;
        },
        NDKKind: {
            Metadata: 0,
            Text: 1,
            ContactList: 3,
        },
    };
});

// TODO: These tests need to be refactored to avoid vi.mock issues with React
describe.skip("useNDKSessionMonitor", () => {
    let mockStorage: MockSessionStorageAdapter;

    beforeEach(() => {
        mockStorage = new MockSessionStorageAdapter();
        mockCurrentUser = null;
        mockAddSession = vi.fn();
        mockSessions = new Map();
        mockSigners = new Map();
        mockStartSession = vi.fn();
        mockStopSession = vi.fn();

        // Reset all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should initialize with empty storage", async () => {
        renderHook(() => useNDKSessionMonitor(mockStorage));

        // Should check for active pubkey
        await waitFor(() => {
            expect(mockStorage.getItemCalls).toContain("ndk-active-pubkey");
        });

        // Should check for sessions
        await waitFor(() => {
            expect(mockStorage.getItemCalls).toContain("ndk-saved-sessions");
        });
    });

    it("should load sessions from storage on mount", async () => {
        // Setup mock storage with a session
        const storedSessions = [{ pubkey: "test-pubkey", signerPayload: "valid-payload" }];
        mockStorage.setItem("ndk-saved-sessions", JSON.stringify(storedSessions));
        mockStorage.setItem("ndk-active-pubkey", "test-pubkey");

        // Clear tracking to focus on hook behavior
        mockStorage.clear();
        mockStorage.setItem("ndk-saved-sessions", JSON.stringify(storedSessions));
        mockStorage.setItem("ndk-active-pubkey", "test-pubkey");

        renderHook(() => useNDKSessionMonitor(mockStorage));

        // Should attempt to add the session
        await waitFor(() => {
            expect(mockAddSession).toHaveBeenCalled();
        });

        // Should attempt to start the session
        await waitFor(() => {
            expect(mockStartSession).toHaveBeenCalledWith("test-pubkey", expect.anything());
        });
    });

    it("should persist new sessions to storage", async () => {
        // Setup a new session that will be detected
        mockSessions = new Map([["new-pubkey", { pubkey: "new-pubkey" }]]);

        const { rerender } = renderHook(() => useNDKSessionMonitor(mockStorage));

        // Force a re-render to trigger the effect that persists sessions
        act(() => {
            rerender();
        });

        // Should have attempted to store the session
        await waitFor(() => {
            const setItemCalls = mockStorage.setItemCalls.map((call) => call.key);
            expect(setItemCalls).toContain("ndk-saved-sessions");
        });
    });

    it("should update active pubkey when current user changes", async () => {
        // Setup initial render with no user
        const { rerender } = renderHook(() => useNDKSessionMonitor(mockStorage));

        // Change current user
        mockCurrentUser = { pubkey: "new-active-pubkey" };

        // Re-render to trigger the effect
        act(() => {
            rerender();
        });

        // Should have set the active pubkey
        await waitFor(() => {
            const setItemCalls = mockStorage.setItemCalls.map((call) => call.key);
            expect(setItemCalls).toContain("ndk-active-pubkey");
        });

        // Should have called startSession with the new pubkey
        await waitFor(() => {
            expect(mockStartSession).toHaveBeenCalledWith("new-active-pubkey", expect.anything());
        });
    });

    it("should remove sessions from storage when they are removed from NDK", async () => {
        // Setup initial sessions
        mockSessions = new Map([["test-pubkey", { pubkey: "test-pubkey" }]]);

        const { rerender } = renderHook(() => useNDKSessionMonitor(mockStorage));

        // Update the ref to track the current sessions
        act(() => {
            rerender();
        });

        // Now remove the session
        mockSessions = new Map();

        // Re-render to trigger the effect
        act(() => {
            rerender();
        });

        // Should have attempted to load the sessions to update them
        await waitFor(() => {
            expect(mockStorage.getItemCalls).toContain("ndk-saved-sessions");
            // And then save the updated sessions (without the removed one)
            const setItemCalls = mockStorage.setItemCalls.map((call) => call.key);
            expect(setItemCalls).toContain("ndk-saved-sessions");
        });
    });
});
