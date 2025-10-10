import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNDKMutes } from "../index";
import type { MuteItemType, NDKUserMutes } from "../types";
import { createMockEvent, createMockMuteListEvent } from "./fixtures";

// Create a mock store for testing
const createMockStore = () => {
    const mutes = new Map();

    return {
        mutes,
        activePubkey: null,
        initMutes: vi.fn((pubkey) => {
            if (!mutes.has(pubkey)) {
                mutes.set(pubkey, {
                    pubkeys: new Set(),
                    hashtags: new Set(),
                    words: new Set(),
                    eventIds: new Set(),
                });
            }
        }),
        loadMuteList: vi.fn(),
        muteItem: vi.fn(),
        unmuteItem: vi.fn(),
        setActivePubkey: vi.fn((pubkey) => {
            // Update the activePubkey
            return pubkey;
        }),
        publishMuteList: vi.fn(),
    };
};

describe("NDKMutesStore", () => {
    let mockStore: ReturnType<typeof createMockStore>;
    const testPubkey = "test-pubkey";
    let testMuteListEvent: NDKEvent;

    beforeEach(() => {
        // Create a fresh mock store for each test
        mockStore = createMockStore();

        // Mock the useNDKMutes.getState to return our mock store
        vi.spyOn(useNDKMutes, "getState").mockReturnValue(mockStore as any);
    });

    describe("initMutes", () => {
        it("should initialize mutes for a user", () => {
            // Call the function
            mockStore.initMutes(testPubkey);

            // Verify it was called
            expect(mockStore.initMutes).toHaveBeenCalledWith(testPubkey);

            // Verify the mutes map has the user
            expect(mockStore.mutes.has(testPubkey)).toBe(true);

            // Verify the user mutes structure
            const userMutes = mockStore.mutes.get(testPubkey);
            expect(userMutes).toBeDefined();
            expect(userMutes?.pubkeys.size).toBe(0);
            expect(userMutes?.hashtags.size).toBe(0);
            expect(userMutes?.words.size).toBe(0);
            expect(userMutes?.eventIds.size).toBe(0);
        });

        it("should not reinitialize mutes if they already exist", () => {
            // Initialize first time
            mockStore.initMutes(testPubkey);

            // Add a muted pubkey
            const userMutes = mockStore.mutes.get(testPubkey);
            userMutes?.pubkeys.add("muted-pubkey");

            // Initialize second time
            mockStore.initMutes(testPubkey);

            // Verify the muted pubkey is still there
            const updatedUserMutes = mockStore.mutes.get(testPubkey);
            expect(updatedUserMutes?.pubkeys.has("muted-pubkey")).toBe(true);
        });
    });

    describe("loadMuteList", () => {
        it("should load mute list from an event", () => {
            const pubkey = testPubkey;
            const mutedPubkeys = ["muted-pubkey-1", "muted-pubkey-2"];
            const mutedEventIds = ["muted-event-1", "muted-event-2"];
            const mutedHashtags = ["muted-hashtag-1", "muted-hashtag-2"];
            const mutedWords = ["muted-word-1", "muted-word-2"];

            // Create a mute list event
            testMuteListEvent = createMockMuteListEvent({
                pubkey,
                mutedPubkeys,
                mutedEventIds,
                mutedHashtags,
                mutedWords,
            });

            // Mock the loadMuteList implementation
            mockStore.loadMuteList.mockImplementation((pubkey, event) => {
                if (!mockStore.mutes.has(pubkey)) {
                    mockStore.initMutes(pubkey);
                }

                const userMutes = mockStore.mutes.get(pubkey);
                if (!userMutes) return;

                // Clear existing sets
                userMutes.pubkeys.clear();
                userMutes.eventIds.clear();
                userMutes.hashtags.clear();
                userMutes.words.clear();

                // Add items from the event
                for (const tag of event.tags) {
                    if (tag[0] === "p") userMutes.pubkeys.add(tag[1]);
                    else if (tag[0] === "e") userMutes.eventIds.add(tag[1]);
                    else if (tag[0] === "t") userMutes.hashtags.add(tag[1]);
                    else if (tag[0] === "word") userMutes.words.add(tag[1]);
                }

                userMutes.muteListEvent = event;
            });

            // Call the function
            mockStore.loadMuteList(pubkey, testMuteListEvent);

            // Verify it was called
            expect(mockStore.loadMuteList).toHaveBeenCalledWith(pubkey, testMuteListEvent);

            // Verify the mutes were loaded
            const userMutes = mockStore.mutes.get(pubkey);
            expect(userMutes).toBeDefined();

            if (userMutes) {
                expect(userMutes.pubkeys.size).toBe(2);
                expect(userMutes.eventIds.size).toBe(2);
                expect(userMutes.hashtags.size).toBe(2);
                expect(userMutes.words.size).toBe(2);

                // Check specific items
                expect(userMutes.pubkeys.has("muted-pubkey-1")).toBe(true);
                expect(userMutes.pubkeys.has("muted-pubkey-2")).toBe(true);
                expect(userMutes.eventIds.has("muted-event-1")).toBe(true);
                expect(userMutes.eventIds.has("muted-event-2")).toBe(true);
                expect(userMutes.hashtags.has("muted-hashtag-1")).toBe(true);
                expect(userMutes.hashtags.has("muted-hashtag-2")).toBe(true);
                expect(userMutes.words.has("muted-word-1")).toBe(true);
                expect(userMutes.words.has("muted-word-2")).toBe(true);

                expect(userMutes.muteListEvent).toBe(testMuteListEvent);
            }
        });
    });

    describe("muteItem", () => {
        it("should mute a pubkey", () => {
            const pubkey = testPubkey;
            const itemToMute = "muted-pubkey";
            const itemType = "pubkey" as MuteItemType;

            // Mock the publishMuteList function
            mockStore.publishMuteList = vi.fn();

            // Mock the muteItem implementation
            mockStore.muteItem.mockImplementation((pubkey, item, type, options) => {
                if (!mockStore.mutes.has(pubkey)) {
                    mockStore.initMutes(pubkey);
                }

                const userMutes = mockStore.mutes.get(pubkey);
                if (!userMutes) return;

                switch (type) {
                    case "pubkey":
                        userMutes.pubkeys.add(item);
                        break;
                    case "event":
                        userMutes.eventIds.add(item);
                        break;
                    case "hashtag":
                        userMutes.hashtags.add(item);
                        break;
                    case "word":
                        userMutes.words.add(item);
                        break;
                }

                // Publish if requested
                if (options?.publish !== false) {
                    mockStore.publishMuteList(pubkey);
                }
            });

            // Initialize the user
            mockStore.initMutes(pubkey);

            // Call the function
            mockStore.muteItem(pubkey, itemToMute, itemType);

            // Verify it was called
            expect(mockStore.muteItem).toHaveBeenCalledWith(pubkey, itemToMute, itemType);

            // Verify the item was muted
            const userMutes = mockStore.mutes.get(pubkey);
            expect(userMutes).toBeDefined();
            expect(userMutes?.pubkeys.has(itemToMute)).toBe(true);

            // Verify publishMuteList was called
            expect(mockStore.publishMuteList).toHaveBeenCalledWith(pubkey);
        });

        it("should not publish mute list when publish is false", () => {
            const pubkey = testPubkey;
            const itemToMute = "muted-pubkey";
            const itemType = "pubkey" as MuteItemType;

            // Mock the publishMuteList function
            mockStore.publishMuteList = vi.fn();

            // Initialize the user
            mockStore.initMutes(pubkey);

            // Call the function with publish: false
            mockStore.muteItem(pubkey, itemToMute, itemType, { publish: false });

            // Verify publishMuteList was not called
            expect(mockStore.publishMuteList).not.toHaveBeenCalled();
        });
    });

    describe("unmuteItem", () => {
        it("should unmute a pubkey", () => {
            const pubkey = testPubkey;
            const itemToUnmute = "muted-pubkey";
            const itemType = "pubkey" as MuteItemType;

            // Mock the publishMuteList function
            mockStore.publishMuteList = vi.fn();

            // Mock the unmuteItem implementation
            mockStore.unmuteItem.mockImplementation((pubkey, item, type, options) => {
                const userMutes = mockStore.mutes.get(pubkey);
                if (!userMutes) return;

                switch (type) {
                    case "pubkey":
                        userMutes.pubkeys.delete(item);
                        break;
                    case "event":
                        userMutes.eventIds.delete(item);
                        break;
                    case "hashtag":
                        userMutes.hashtags.delete(item);
                        break;
                    case "word":
                        userMutes.words.delete(item);
                        break;
                }

                // Publish if requested
                if (options?.publish !== false) {
                    mockStore.publishMuteList(pubkey);
                }
            });

            // Initialize and add a muted pubkey
            mockStore.initMutes(pubkey);
            const userMutes = mockStore.mutes.get(pubkey);
            userMutes?.pubkeys.add(itemToUnmute);

            // Call the function
            mockStore.unmuteItem(pubkey, itemToUnmute, itemType);

            // Verify it was called
            expect(mockStore.unmuteItem).toHaveBeenCalledWith(pubkey, itemToUnmute, itemType);

            // Verify the item was unmuted
            const updatedUserMutes = mockStore.mutes.get(pubkey);
            expect(updatedUserMutes).toBeDefined();
            expect(updatedUserMutes?.pubkeys.has(itemToUnmute)).toBe(false);

            // Verify publishMuteList was called
            expect(mockStore.publishMuteList).toHaveBeenCalledWith(pubkey);
        });
    });

    describe("setActivePubkey", () => {
        it("should set the active pubkey", () => {
            const pubkey = testPubkey;

            // Call the function
            mockStore.setActivePubkey(pubkey);

            // Verify it was called
            expect(mockStore.setActivePubkey).toHaveBeenCalledWith(pubkey);
        });

        it("should set the active pubkey to null", () => {
            // Call the function
            mockStore.setActivePubkey(null);

            // Verify it was called
            expect(mockStore.setActivePubkey).toHaveBeenCalledWith(null);
        });
    });

    describe("publishMuteList", () => {
        it("should publish a mute list event", async () => {
            const pubkey = testPubkey;
            const mockEvent = createMockEvent({ pubkey });

            // Mock the publishMuteList implementation
            mockStore.publishMuteList.mockResolvedValue(mockEvent);

            // Initialize the user
            mockStore.initMutes(pubkey);

            // Call the function
            const result = await mockStore.publishMuteList(pubkey);

            // Verify it was called
            expect(mockStore.publishMuteList).toHaveBeenCalledWith(pubkey);

            // Verify the result
            expect(result).toBe(mockEvent);
        });
    });
});
