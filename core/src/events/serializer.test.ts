import { describe, expect, it } from "bun:test";
import { NDKEvent } from "./index.js";
import { serialize } from "./serializer.js";

describe("Event Serializer Validation", () => {
    it("should serialize a valid event", () => {
        const event = new NDKEvent(undefined, {
            kind: 1,
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [["p", "b".repeat(64)]],
        });

        const result = serialize.call(event);
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
    });

    it("should throw detailed error for missing kind (raw event)", () => {
        // Test with a raw event object that bypasses NDKEvent defaults
        const rawEvent = {
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [],
        } as any;

        expect(() => serialize.call(rawEvent)).toThrow(
            "Can't serialize event with invalid properties: kind (must be number, got undefined)",
        );
    });

    it("should throw detailed error for invalid kind type", () => {
        const event = new NDKEvent(undefined, {
            kind: "1" as any,
            content: "test content",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [],
        });

        expect(() => serialize.call(event)).toThrow(
            "Can't serialize event with invalid properties: kind (must be number, got string)",
        );
    });

    it("should throw detailed error for missing content (raw event)", () => {
        // Test with a raw event object that bypasses NDKEvent defaults
        const rawEvent = {
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [],
        } as any;

        expect(() => serialize.call(rawEvent)).toThrow(
            "Can't serialize event with invalid properties: content (must be string, got undefined)",
        );
    });

    it("should throw detailed error for invalid content type", () => {
        const event = new NDKEvent(undefined, {
            kind: 1,
            content: 123 as any,
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [],
        });

        expect(() => serialize.call(event)).toThrow(
            "Can't serialize event with invalid properties: content (must be string, got number)",
        );
    });

    it("should throw detailed error for missing created_at (raw event)", () => {
        // Test with a raw event object that bypasses NDKEvent defaults
        const rawEvent = {
            kind: 1,
            content: "test",
            pubkey: "a".repeat(64),
            tags: [],
        } as any;

        expect(() => serialize.call(rawEvent)).toThrow(
            "Can't serialize event with invalid properties: created_at (must be number, got undefined)",
        );
    });

    it("should throw detailed error for missing pubkey", () => {
        const rawEvent = {
            kind: 1,
            content: "test",
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
        } as any;

        expect(() => serialize.call(rawEvent)).toThrow(
            "Can't serialize event with invalid properties: pubkey (must be string, got undefined)",
        );
    });

    it("should throw detailed error for invalid tags type", () => {
        const event = new NDKEvent(undefined, {
            kind: 1,
            content: "test",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: "not-an-array" as any,
        });

        expect(() => serialize.call(event)).toThrow(
            "Can't serialize event with invalid properties: tags (must be array, got string)",
        );
    });

    it("should throw detailed error for invalid tag structure (non-array tag)", () => {
        const event = new NDKEvent(undefined, {
            kind: 1,
            content: "test",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: ["invalid" as any],
        });

        expect(() => serialize.call(event)).toThrow(
            "Can't serialize event with invalid properties: tags[0] (must be array, got string)",
        );
    });

    it("should throw detailed error for invalid tag value (non-string in tag array)", () => {
        const event = new NDKEvent(undefined, {
            kind: 1,
            content: "test",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [["p", 123 as any]],
        });

        expect(() => serialize.call(event)).toThrow(
            "Can't serialize event with invalid properties: tags[0][1] (must be string, got number)",
        );
    });

    it("should throw on first invalid property (fail fast)", () => {
        // Test with a raw event object that bypasses NDKEvent defaults
        // The validation fails fast, so only the first error is reported
        const rawEvent = {
            kind: "invalid" as any,
            content: 123 as any,
            pubkey: "a".repeat(64),
            tags: [],
        } as any;

        expect(() => serialize.call(rawEvent)).toThrow("kind (must be number, got string)");
    });

    it("should include full event JSON in error message", () => {
        const rawEvent = {
            kind: "invalid-kind",
            content: "test",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: "a".repeat(64),
            tags: [],
        } as any;

        expect(() => serialize.call(rawEvent)).toThrow(/"kind":"invalid-kind"/);
    });
});
