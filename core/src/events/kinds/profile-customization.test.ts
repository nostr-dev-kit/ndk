import { describe, expect, it } from "vitest";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";
import { NDKProfileCustomization } from "./profile-customization.js";
import { wrapEvent } from "../wrap.js";

describe("NDKProfileCustomization", () => {
    describe("Kind Handling", () => {
        it("should default to NDKKind.ProfileCustomization (19999)", () => {
            const pc = new NDKProfileCustomization();
            expect(pc.kind).toBe(NDKKind.ProfileCustomization);
        });

        it("should be included in the kinds array", () => {
            expect(NDKProfileCustomization.kinds).toContain(NDKKind.ProfileCustomization);
        });
    });

    describe("wrapEvent Integration", () => {
        it("should wrap kind 19999 events as NDKProfileCustomization", () => {
            const rawEvent = new NDKEvent(undefined, {
                kind: 19999,
                content: "",
                created_at: Math.floor(Date.now() / 1000),
                tags: [["background-color", "#ff0000"]],
                pubkey: "test-pubkey",
                id: "test-id",
                sig: "test-sig",
            });

            const wrapped = wrapEvent(rawEvent);

            expect(wrapped).toBeInstanceOf(NDKProfileCustomization);
            expect((wrapped as NDKProfileCustomization).backgroundColor).toBe("#ff0000");
        });
    });

    describe("Color Properties", () => {
        it("should get/set backgroundColor", () => {
            const pc = new NDKProfileCustomization();
            expect(pc.backgroundColor).toBeUndefined();

            pc.backgroundColor = "#ffffff";
            expect(pc.backgroundColor).toBe("#ffffff");
            expect(pc.tags.find((t) => t[0] === "background-color")).toEqual(["background-color", "#ffffff"]);

            pc.backgroundColor = undefined;
            expect(pc.backgroundColor).toBeUndefined();
        });

        it("should get/set foregroundColor", () => {
            const pc = new NDKProfileCustomization();
            expect(pc.foregroundColor).toBeUndefined();

            pc.foregroundColor = "#000000";
            expect(pc.foregroundColor).toBe("#000000");
            expect(pc.tags.find((t) => t[0] === "foreground-color")).toEqual(["foreground-color", "#000000"]);

            pc.foregroundColor = undefined;
            expect(pc.foregroundColor).toBeUndefined();
        });
    });

    describe("Background Music", () => {
        it("should get/set backgroundMusic URL", () => {
            const pc = new NDKProfileCustomization();
            expect(pc.backgroundMusic).toBeUndefined();

            pc.backgroundMusic = "https://example.com/music.mp3";
            expect(pc.backgroundMusic).toBe("https://example.com/music.mp3");
            expect(pc.tags.find((t) => t[0] === "background-music")).toEqual([
                "background-music",
                "https://example.com/music.mp3",
            ]);

            pc.backgroundMusic = undefined;
            expect(pc.backgroundMusic).toBeUndefined();
        });
    });

    describe("Priority Kinds", () => {
        it("should get/set priorityKinds", () => {
            const pc = new NDKProfileCustomization();
            expect(pc.priorityKinds).toEqual([]);

            pc.priorityKinds = [1, 6, 7];
            expect(pc.priorityKinds).toEqual([1, 6, 7]);
            expect(pc.tags.find((t) => t[0] === "priority_kinds")).toEqual(["priority_kinds", "1", "6", "7"]);

            pc.priorityKinds = [];
            expect(pc.priorityKinds).toEqual([]);
        });

        it("should filter out NaN values from priorityKinds", () => {
            const pc = new NDKProfileCustomization();
            pc.tags.push(["priority_kinds", "1", "invalid", "3"]);
            expect(pc.priorityKinds).toEqual([1, 3]);
        });
    });

    describe("Custom Fields", () => {
        it("should get/set custom fields", () => {
            const pc = new NDKProfileCustomization();

            pc.setCustomField("favorite_color", "blue");
            pc.setCustomField("hobby", "coding");

            expect(pc.getCustomField("favorite_color")).toBe("blue");
            expect(pc.getCustomField("hobby")).toBe("coding");

            const fields = pc.customFields;
            expect(fields.get("favorite_color")).toBe("blue");
            expect(fields.get("hobby")).toBe("coding");
        });

        it("should remove custom field when set to undefined", () => {
            const pc = new NDKProfileCustomization();
            pc.setCustomField("test", "value");
            expect(pc.getCustomField("test")).toBe("value");

            pc.setCustomField("test", undefined);
            expect(pc.getCustomField("test")).toBeUndefined();
        });

        it("should use first-wins strategy for duplicate custom tags", () => {
            const pc = new NDKProfileCustomization();
            // Manually add duplicate tags to simulate an event with duplicates
            pc.tags.push(["custom", "field", "first-value"]);
            pc.tags.push(["custom", "field", "second-value"]);

            // Both getCustomField and customFields should return first value
            expect(pc.getCustomField("field")).toBe("first-value");
            expect(pc.customFields.get("field")).toBe("first-value");
        });

        it("should handle multiple custom fields with duplicates", () => {
            const pc = new NDKProfileCustomization();
            pc.tags.push(["custom", "a", "a-first"]);
            pc.tags.push(["custom", "b", "b-first"]);
            pc.tags.push(["custom", "a", "a-second"]);
            pc.tags.push(["custom", "b", "b-second"]);

            const fields = pc.customFields;
            expect(fields.size).toBe(2);
            expect(fields.get("a")).toBe("a-first");
            expect(fields.get("b")).toBe("b-first");
        });
    });

    describe("Static from() method", () => {
        it("should create NDKProfileCustomization from NDKEvent", () => {
            const event = new NDKEvent(undefined, {
                kind: 19999,
                content: "",
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["background-color", "#123456"],
                    ["foreground-color", "#abcdef"],
                    ["custom", "test", "value"],
                ],
                pubkey: "test-pubkey",
                id: "test-id",
                sig: "test-sig",
            });

            const pc = NDKProfileCustomization.from(event);

            expect(pc).toBeInstanceOf(NDKProfileCustomization);
            expect(pc.backgroundColor).toBe("#123456");
            expect(pc.foregroundColor).toBe("#abcdef");
            expect(pc.getCustomField("test")).toBe("value");
        });
    });
});
