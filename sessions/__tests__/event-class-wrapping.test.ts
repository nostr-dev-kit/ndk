import NDK, { NDKEvent, type NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NDKSessionManager } from "../src/manager";

/**
 * Custom event class for testing
 */
class CustomInterestList extends NDKEvent {
    static kinds = [10015 as NDKKind];
    static kind = 10015 as NDKKind;

    static from(event: NDKEvent): CustomInterestList {
        const customEvent = new CustomInterestList(event.ndk, event.rawEvent());
        return customEvent;
    }

    get interests(): string[] {
        return this.getMatchingTags("t").map((tag) => tag[1]);
    }

    addInterest(interest: string): void {
        this.tags.push(["t", interest]);
    }
}

/**
 * Another custom event class for testing
 */
class CustomBookmarkList extends NDKEvent {
    static kinds = [10003 as NDKKind];
    static kind = 10003 as NDKKind;

    static from(event: NDKEvent): CustomBookmarkList {
        const customEvent = new CustomBookmarkList(event.ndk, event.rawEvent());
        return customEvent;
    }

    get bookmarks(): string[] {
        return this.getMatchingTags("e").map((tag) => tag[1]);
    }
}

/**
 * Custom event class that handles multiple kinds
 */
class CustomMultiKindList extends NDKEvent {
    static kinds = [10016 as NDKKind, 10017 as NDKKind];

    static from(event: NDKEvent): CustomMultiKindList {
        const customEvent = new CustomMultiKindList(event.ndk, event.rawEvent());
        return customEvent;
    }

    get items(): string[] {
        return this.getMatchingTags("item").map((tag) => tag[1]);
    }
}

describe("Event Class Wrapping", () => {
    let ndk: NDK;
    let manager: NDKSessionManager;

    beforeEach(() => {
        ndk = new NDK({ explicitRelayUrls: ["wss://relay.example.com"] });
        manager = new NDKSessionManager(ndk);
    });

    it("should wrap custom event with provided class", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const user = await signer.user();

        // Mock NDK subscribe to capture the onEvent handler
        let capturedHandler: ((event: NDKEvent) => void) | undefined;
        vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
            if (handlers?.onEvent) {
                capturedHandler = handlers.onEvent;
            }
            return {
                stop: vi.fn(),
            } as any;
        });

        // Login with custom event class mapping
        await manager.login(signer, {
            setActive: true,
        });

        // Start session with custom event class
        manager.startSession(user.pubkey, {
            events: new Map([[10015 as NDKKind, CustomInterestList]]),
        });

        // Create a mock event of kind 10015
        const rawEvent = new NDKEvent(ndk);
        rawEvent.kind = 10015 as NDKKind;
        rawEvent.pubkey = user.pubkey;
        rawEvent.content = "";
        rawEvent.tags = [
            ["t", "nostr"],
            ["t", "bitcoin"],
        ];
        rawEvent.created_at = Math.floor(Date.now() / 1000);

        // Simulate receiving the event
        expect(capturedHandler).toBeDefined();
        capturedHandler!(rawEvent);

        // Check that the event was wrapped correctly
        const session = manager.getSession(user.pubkey);
        const storedEvent = session!.events.get(10015 as NDKKind);
        expect(storedEvent).toBeDefined();
        expect(storedEvent).toBeInstanceOf(CustomInterestList);

        // Test custom method
        const customEvent = storedEvent as CustomInterestList;
        expect(customEvent.interests).toEqual(["nostr", "bitcoin"]);
    });

    it("should not wrap event when no class is provided", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const user = await signer.user();

        let capturedHandler: ((event: NDKEvent) => void) | undefined;
        vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
            if (handlers?.onEvent) {
                capturedHandler = handlers.onEvent;
            }
            return {
                stop: vi.fn(),
            } as any;
        });

        await manager.login(signer, {
            setActive: true,
        });

        manager.startSession(user.pubkey, {
            events: new Map([[10015 as NDKKind, undefined]]),
        });

        const rawEvent = new NDKEvent(ndk);
        rawEvent.kind = 10015 as NDKKind;
        rawEvent.pubkey = user.pubkey;
        rawEvent.content = "";
        rawEvent.tags = [["t", "nostr"]];
        rawEvent.created_at = Math.floor(Date.now() / 1000);

        expect(capturedHandler).toBeDefined();
        capturedHandler!(rawEvent);

        // Event should be stored as regular NDKEvent
        const session = manager.getSession(user.pubkey);
        const storedEvent = session!.events.get(10015 as NDKKind);
        expect(storedEvent).toBeDefined();
        expect(storedEvent).toBeInstanceOf(NDKEvent);
        expect(storedEvent).not.toBeInstanceOf(CustomInterestList);
    });

    it("should handle multiple custom event classes", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const user = await signer.user();

        let capturedHandler: ((event: NDKEvent) => void) | undefined;
        vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
            if (handlers?.onEvent) {
                capturedHandler = handlers.onEvent;
            }
            return {
                stop: vi.fn(),
            } as any;
        });

        await manager.login(signer, {
            setActive: true,
        });

        manager.startSession(user.pubkey, {
            events: new Map([
                [10015 as NDKKind, CustomInterestList],
                [10003 as NDKKind, CustomBookmarkList],
            ]),
        });

        // Create and handle first event type
        const interestEvent = new NDKEvent(ndk);
        interestEvent.kind = 10015 as NDKKind;
        interestEvent.pubkey = user.pubkey;
        interestEvent.tags = [["t", "coding"]];
        interestEvent.created_at = Math.floor(Date.now() / 1000);

        // Create and handle second event type
        const bookmarkEvent = new NDKEvent(ndk);
        bookmarkEvent.kind = 10003 as NDKKind;
        bookmarkEvent.pubkey = user.pubkey;
        bookmarkEvent.tags = [["e", "eventid123"]];
        bookmarkEvent.created_at = Math.floor(Date.now() / 1000);

        expect(capturedHandler).toBeDefined();
        capturedHandler!(interestEvent);
        capturedHandler!(bookmarkEvent);

        // Check both events are wrapped correctly
        const session = manager.getSession(user.pubkey);
        const storedInterestEvent = session!.events.get(10015 as NDKKind);
        expect(storedInterestEvent).toBeInstanceOf(CustomInterestList);
        expect((storedInterestEvent as CustomInterestList).interests).toEqual(["coding"]);

        const storedBookmarkEvent = session!.events.get(10003 as NDKKind);
        expect(storedBookmarkEvent).toBeInstanceOf(CustomBookmarkList);
        expect((storedBookmarkEvent as CustomBookmarkList).bookmarks).toEqual(["eventid123"]);
    });

    it("should only wrap newer events", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const user = await signer.user();

        let capturedHandler: ((event: NDKEvent) => void) | undefined;
        vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
            if (handlers?.onEvent) {
                capturedHandler = handlers.onEvent;
            }
            return {
                stop: vi.fn(),
            } as any;
        });

        await manager.login(signer, {
            setActive: true,
        });

        manager.startSession(user.pubkey, {
            events: new Map([[10015 as NDKKind, CustomInterestList]]),
        });

        const now = Math.floor(Date.now() / 1000);

        // Create and handle older event
        const olderEvent = new NDKEvent(ndk);
        olderEvent.kind = 10015 as NDKKind;
        olderEvent.pubkey = user.pubkey;
        olderEvent.tags = [["t", "old"]];
        olderEvent.created_at = now - 100;

        // Create and handle newer event
        const newerEvent = new NDKEvent(ndk);
        newerEvent.kind = 10015 as NDKKind;
        newerEvent.pubkey = user.pubkey;
        newerEvent.tags = [["t", "new"]];
        newerEvent.created_at = now;

        expect(capturedHandler).toBeDefined();
        // Handle newer event first
        capturedHandler!(newerEvent);

        // Try to handle older event (should be ignored)
        capturedHandler!(olderEvent);

        // Should still have the newer event
        const session = manager.getSession(user.pubkey);
        const storedEvent = session!.events.get(10015 as NDKKind);
        expect(storedEvent).toBeInstanceOf(CustomInterestList);
        expect((storedEvent as CustomInterestList).interests).toEqual(["new"]);
    });

    it("should handle event class without from method gracefully", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const user = await signer.user();

        // Create a class without a from method
        class InvalidEventClass {}

        let capturedHandler: ((event: NDKEvent) => void) | undefined;
        vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
            if (handlers?.onEvent) {
                capturedHandler = handlers.onEvent;
            }
            return {
                stop: vi.fn(),
            } as any;
        });

        await manager.login(signer, {
            setActive: true,
        });

        manager.startSession(user.pubkey, {
            events: new Map([[10015 as NDKKind, InvalidEventClass as any]]),
        });

        const rawEvent = new NDKEvent(ndk);
        rawEvent.kind = 10015 as NDKKind;
        rawEvent.pubkey = user.pubkey;
        rawEvent.tags = [["t", "test"]];
        rawEvent.created_at = Math.floor(Date.now() / 1000);

        expect(capturedHandler).toBeDefined();
        // Should not throw
        expect(() => capturedHandler!(rawEvent)).not.toThrow();

        // Should store as regular NDKEvent since class doesn't have from method
        const session = manager.getSession(user.pubkey);
        const storedEvent = session!.events.get(10015 as NDKKind);
        expect(storedEvent).toBeDefined();
        expect(storedEvent).toBeInstanceOf(NDKEvent);
    });

    describe("eventConstructors option", () => {
        it("should wrap event with eventConstructors array", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            let capturedHandler: ((event: NDKEvent) => void) | undefined;
            vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
                if (handlers?.onEvent) {
                    capturedHandler = handlers.onEvent;
                }
                return {
                    stop: vi.fn(),
                } as any;
            });

            await manager.login(signer, {
                setActive: true,
            });

            // Use eventConstructors instead of events Map
            manager.startSession(user.pubkey, {
                eventConstructors: [CustomInterestList],
            });

            const rawEvent = new NDKEvent(ndk);
            rawEvent.kind = 10015 as NDKKind;
            rawEvent.pubkey = user.pubkey;
            rawEvent.content = "";
            rawEvent.tags = [
                ["t", "nostr"],
                ["t", "bitcoin"],
            ];
            rawEvent.created_at = Math.floor(Date.now() / 1000);

            expect(capturedHandler).toBeDefined();
            capturedHandler!(rawEvent);

            const session = manager.getSession(user.pubkey);
            const storedEvent = session!.events.get(10015 as NDKKind);
            expect(storedEvent).toBeDefined();
            expect(storedEvent).toBeInstanceOf(CustomInterestList);

            const customEvent = storedEvent as CustomInterestList;
            expect(customEvent.interests).toEqual(["nostr", "bitcoin"]);
        });

        it("should handle multiple event constructors", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            let capturedHandler: ((event: NDKEvent) => void) | undefined;
            vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
                if (handlers?.onEvent) {
                    capturedHandler = handlers.onEvent;
                }
                return {
                    stop: vi.fn(),
                } as any;
            });

            await manager.login(signer, {
                setActive: true,
            });

            manager.startSession(user.pubkey, {
                eventConstructors: [CustomInterestList, CustomBookmarkList],
            });

            const interestEvent = new NDKEvent(ndk);
            interestEvent.kind = 10015 as NDKKind;
            interestEvent.pubkey = user.pubkey;
            interestEvent.tags = [["t", "coding"]];
            interestEvent.created_at = Math.floor(Date.now() / 1000);

            const bookmarkEvent = new NDKEvent(ndk);
            bookmarkEvent.kind = 10003 as NDKKind;
            bookmarkEvent.pubkey = user.pubkey;
            bookmarkEvent.tags = [["e", "eventid123"]];
            bookmarkEvent.created_at = Math.floor(Date.now() / 1000);

            expect(capturedHandler).toBeDefined();
            capturedHandler!(interestEvent);
            capturedHandler!(bookmarkEvent);

            const session = manager.getSession(user.pubkey);
            const storedInterestEvent = session!.events.get(10015 as NDKKind);
            expect(storedInterestEvent).toBeInstanceOf(CustomInterestList);
            expect((storedInterestEvent as CustomInterestList).interests).toEqual(["coding"]);

            const storedBookmarkEvent = session!.events.get(10003 as NDKKind);
            expect(storedBookmarkEvent).toBeInstanceOf(CustomBookmarkList);
            expect((storedBookmarkEvent as CustomBookmarkList).bookmarks).toEqual(["eventid123"]);
        });

        it("should handle constructor with multiple kinds", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            let capturedHandler: ((event: NDKEvent) => void) | undefined;
            vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
                if (handlers?.onEvent) {
                    capturedHandler = handlers.onEvent;
                }
                return {
                    stop: vi.fn(),
                } as any;
            });

            await manager.login(signer, {
                setActive: true,
            });

            manager.startSession(user.pubkey, {
                eventConstructors: [CustomMultiKindList],
            });

            // Create event with first kind
            const event1 = new NDKEvent(ndk);
            event1.kind = 10016 as NDKKind;
            event1.pubkey = user.pubkey;
            event1.tags = [["item", "item1"]];
            event1.created_at = Math.floor(Date.now() / 1000);

            // Create event with second kind
            const event2 = new NDKEvent(ndk);
            event2.kind = 10017 as NDKKind;
            event2.pubkey = user.pubkey;
            event2.tags = [["item", "item2"]];
            event2.created_at = Math.floor(Date.now() / 1000);

            expect(capturedHandler).toBeDefined();
            capturedHandler!(event1);
            capturedHandler!(event2);

            const session = manager.getSession(user.pubkey);

            // Both kinds should be wrapped with the same constructor
            const storedEvent1 = session!.events.get(10016 as NDKKind);
            expect(storedEvent1).toBeInstanceOf(CustomMultiKindList);
            expect((storedEvent1 as CustomMultiKindList).items).toEqual(["item1"]);

            const storedEvent2 = session!.events.get(10017 as NDKKind);
            expect(storedEvent2).toBeInstanceOf(CustomMultiKindList);
            expect((storedEvent2 as CustomMultiKindList).items).toEqual(["item2"]);
        });

        it("should merge eventConstructors with events Map", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            let capturedHandler: ((event: NDKEvent) => void) | undefined;
            vi.spyOn(ndk, "subscribe").mockImplementation((filters, opts, handlers) => {
                if (handlers?.onEvent) {
                    capturedHandler = handlers.onEvent;
                }
                return {
                    stop: vi.fn(),
                } as any;
            });

            await manager.login(signer, {
                setActive: true,
            });

            // Use both events Map and eventConstructors
            manager.startSession(user.pubkey, {
                events: new Map([[10015 as NDKKind, CustomInterestList]]),
                eventConstructors: [CustomBookmarkList],
            });

            const interestEvent = new NDKEvent(ndk);
            interestEvent.kind = 10015 as NDKKind;
            interestEvent.pubkey = user.pubkey;
            interestEvent.tags = [["t", "coding"]];
            interestEvent.created_at = Math.floor(Date.now() / 1000);

            const bookmarkEvent = new NDKEvent(ndk);
            bookmarkEvent.kind = 10003 as NDKKind;
            bookmarkEvent.pubkey = user.pubkey;
            bookmarkEvent.tags = [["e", "eventid123"]];
            bookmarkEvent.created_at = Math.floor(Date.now() / 1000);

            expect(capturedHandler).toBeDefined();
            capturedHandler!(interestEvent);
            capturedHandler!(bookmarkEvent);

            const session = manager.getSession(user.pubkey);

            // Both should be wrapped
            const storedInterestEvent = session!.events.get(10015 as NDKKind);
            expect(storedInterestEvent).toBeInstanceOf(CustomInterestList);

            const storedBookmarkEvent = session!.events.get(10003 as NDKKind);
            expect(storedBookmarkEvent).toBeInstanceOf(CustomBookmarkList);
        });

        it("should handle empty eventConstructors array", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer, {
                setActive: true,
            });

            // Empty eventConstructors should not throw
            expect(() => {
                manager.startSession(user.pubkey, {
                    eventConstructors: [],
                    follows: true, // Need to fetch something to create a subscription
                });
            }).not.toThrow();
        });
    });
});
