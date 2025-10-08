import { describe, expect, it } from "vitest";
import { createMockEvent, createMockMuteListEvent } from "../../mutes/store/__tests__/fixtures";
import { isMuted } from "../mute";

describe("mute utilities", () => {
    describe("isMuted", () => {
        it("should return true when event pubkey is muted", () => {
            const event = createMockEvent({ pubkey: "muted-pubkey" });
            const criteria = {
                pubkeys: new Set<string>(["muted-pubkey"]),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(),
                words: new Set<string>(),
            };

            expect(isMuted(event, criteria)).toBe(true);
        });

        it("should return true when event ID is muted", () => {
            const event = createMockEvent({ id: "muted-event-id" });
            const criteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(["muted-event-id"]),
                hashtags: new Set<string>(),
                words: new Set<string>(),
            };

            expect(isMuted(event, criteria)).toBe(true);
        });

        it("should return true when event references a muted event", () => {
            const event = createMockEvent({
                tags: [["e", "muted-event-id"]],
            });
            const criteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(["muted-event-id"]),
                hashtags: new Set<string>(),
                words: new Set<string>(),
            };

            expect(isMuted(event, criteria)).toBe(true);
        });

        it("should return true when event has a muted hashtag", () => {
            const event = createMockEvent({
                tags: [["t", "muted-hashtag"]],
            });
            const criteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(["muted-hashtag"]),
                words: new Set<string>(),
            };

            expect(isMuted(event, criteria)).toBe(true);
        });

        it("should return true when event content contains a muted word", () => {
            const event = createMockEvent({
                content: "This content contains a muted-word that should be filtered.",
            });
            const criteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(),
                words: new Set<string>(["muted-word"]),
            };

            expect(isMuted(event, criteria)).toBe(true);
        });

        it("should return false when event doesn't match any mute criteria", () => {
            const event = createMockEvent({
                pubkey: "non-muted-pubkey",
                id: "non-muted-event-id",
                content: "This content is fine.",
                tags: [
                    ["t", "non-muted-hashtag"],
                    ["e", "non-muted-event-id"],
                ],
            });
            const criteria = {
                pubkeys: new Set<string>(["muted-pubkey"]),
                eventIds: new Set<string>(["muted-event-id"]),
                hashtags: new Set<string>(["muted-hashtag"]),
                words: new Set<string>(["muted-word"]),
            };

            expect(isMuted(event, criteria)).toBe(false);
        });

        it("should handle case insensitivity for hashtags", () => {
            const event = createMockEvent({
                tags: [["t", "MuTeD-HaShTaG"]],
            });
            const criteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(["muted-hashtag"]),
                words: new Set<string>(),
            };

            expect(isMuted(event, criteria)).toBe(true);
        });

        it("should handle null or undefined criteria gracefully", () => {
            const event = createMockEvent({});

            // @ts-expect-error - Testing with null criteria
            expect(isMuted(event, null)).toBe(false);

            // @ts-expect-error - Testing with undefined criteria
            expect(isMuted(event, undefined)).toBe(false);
        });

        it("should handle empty criteria sets gracefully", () => {
            const event = createMockEvent({});
            const criteria = {
                pubkeys: new Set<string>(),
                eventIds: new Set<string>(),
                hashtags: new Set<string>(),
                words: new Set<string>(),
            };

            expect(isMuted(event, criteria)).toBe(false);
        });
    });
});
