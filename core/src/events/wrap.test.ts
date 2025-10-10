import { beforeEach, describe, expect, it } from "vitest";
import type { NostrEvent } from "./index.js";
import { NDKEvent } from "./index.js";
import { getRegisteredEventClasses, registerEventClass, unregisterEventClass, wrapEvent } from "./wrap.js";

class TestCustomEvent extends NDKEvent {
    static kinds = [99999];

    static from(event: NDKEvent) {
        return new TestCustomEvent(event.ndk, event);
    }

    constructor(ndk: any, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= 99999;
    }

    get customProperty(): string | undefined {
        return this.tagValue("custom");
    }

    set customProperty(value: string | undefined) {
        this.removeTag("custom");
        if (value) this.tags.push(["custom", value]);
    }
}

class TestMultiKindEvent extends NDKEvent {
    static kinds = [88888, 88889];

    static from(event: NDKEvent) {
        return new TestMultiKindEvent(event.ndk, event);
    }

    constructor(ndk: any, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= 88888;
    }
}

describe("Event Class Registration", () => {
    beforeEach(() => {
        // Clean up any registered classes
        const registered = getRegisteredEventClasses();
        for (const klass of registered) {
            unregisterEventClass(klass);
        }
    });

    it("should register and use custom event class", () => {
        registerEventClass(TestCustomEvent);

        const rawEvent = new NDKEvent(undefined, {
            kind: 99999,
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            tags: [["custom", "test-value"]],
            pubkey: "test-pubkey",
            id: "test-id",
            sig: "test-sig",
        });

        const wrappedEvent = wrapEvent(rawEvent);

        expect(wrappedEvent).toBeInstanceOf(TestCustomEvent);
        expect((wrappedEvent as TestCustomEvent).customProperty).toBe("test-value");
    });

    it("should handle multiple kinds in one class", () => {
        registerEventClass(TestMultiKindEvent);

        const rawEvent1 = new NDKEvent(undefined, {
            kind: 88888,
            content: "test content 1",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            pubkey: "test-pubkey",
            id: "test-id-1",
            sig: "test-sig",
        });

        const rawEvent2 = new NDKEvent(undefined, {
            kind: 88889,
            content: "test content 2",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            pubkey: "test-pubkey",
            id: "test-id-2",
            sig: "test-sig",
        });

        const wrappedEvent1 = wrapEvent(rawEvent1);
        const wrappedEvent2 = wrapEvent(rawEvent2);

        expect(wrappedEvent1).toBeInstanceOf(TestMultiKindEvent);
        expect(wrappedEvent2).toBeInstanceOf(TestMultiKindEvent);
    });

    it("should unregister custom event class", () => {
        registerEventClass(TestCustomEvent);

        const rawEvent = new NDKEvent(undefined, {
            kind: 99999,
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            pubkey: "test-pubkey",
            id: "test-id",
            sig: "test-sig",
        });

        let wrappedEvent = wrapEvent(rawEvent);
        expect(wrappedEvent).toBeInstanceOf(TestCustomEvent);

        unregisterEventClass(TestCustomEvent);

        wrappedEvent = wrapEvent(rawEvent);
        expect(wrappedEvent).toBeInstanceOf(NDKEvent);
        expect(wrappedEvent).not.toBeInstanceOf(TestCustomEvent);
    });

    it("should return registered event classes", () => {
        expect(getRegisteredEventClasses().size).toBe(0);

        registerEventClass(TestCustomEvent);
        expect(getRegisteredEventClasses().size).toBe(1);
        expect(getRegisteredEventClasses().has(TestCustomEvent)).toBe(true);

        registerEventClass(TestMultiKindEvent);
        expect(getRegisteredEventClasses().size).toBe(2);
        expect(getRegisteredEventClasses().has(TestMultiKindEvent)).toBe(true);
    });

    it("should return original event for unregistered kinds", () => {
        const rawEvent = new NDKEvent(undefined, {
            kind: 77777, // Unregistered kind
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            pubkey: "test-pubkey",
            id: "test-id",
            sig: "test-sig",
        });

        const wrappedEvent = wrapEvent(rawEvent);
        expect(wrappedEvent).toBe(rawEvent);
        expect(wrappedEvent).toBeInstanceOf(NDKEvent);
    });

    it("should prioritize custom classes over built-in classes for same kind", () => {
        // This test assumes we're not overriding any existing built-in kinds
        // Using a unique kind number to avoid conflicts
        registerEventClass(TestCustomEvent);

        const rawEvent = new NDKEvent(undefined, {
            kind: 99999,
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            pubkey: "test-pubkey",
            id: "test-id",
            sig: "test-sig",
        });

        const wrappedEvent = wrapEvent(rawEvent);
        expect(wrappedEvent).toBeInstanceOf(TestCustomEvent);
    });
});
