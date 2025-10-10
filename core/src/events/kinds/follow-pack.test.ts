import { describe, expect, it } from "vitest";
import type { NDKImetaTag } from "../../utils/imeta";
import { mapImetaTag } from "../../utils/imeta";
import { NDKFollowPack } from "./follow-pack";
import { NDKKind } from "./index";

// Helper imeta tag object
const imetaObj: NDKImetaTag = {
    url: "https://example.com/image.png",
    alt: "Example image",
    dim: "100x100",
};

describe("NDKFollowPack", () => {
    describe("Kind Handling", () => {
        it("should default to NDKKind.FollowPack (39089)", () => {
            const fp = new NDKFollowPack();
            expect(fp.kind).toBe(NDKKind.FollowPack);
        });

        it("should accept NDKKind.FollowPack and NDKKind.MediaFollowPack", () => {
            const fp = new NDKFollowPack();
            fp.kind = NDKKind.FollowPack;
            expect(NDKFollowPack.kinds).toContain(fp.kind);

            fp.kind = NDKKind.MediaFollowPack;
            expect(NDKFollowPack.kinds).toContain(fp.kind);
        });
    });

    describe("Getters/Setters", () => {
        it("should get/set title and manipulate the title tag", () => {
            const fp = new NDKFollowPack();
            expect(fp.title).toBeUndefined();

            fp.title = "Test Title";
            expect(fp.title).toBe("Test Title");
            expect(fp.tags.find((t) => t[0] === "title")).toEqual(["title", "Test Title"]);

            fp.title = undefined;
            expect(fp.title).toBeUndefined();
            expect(fp.tags.find((t) => t[0] === "title")).toBeUndefined();
        });

        it("should get/set identifier (d tag)", () => {
            const fp = new NDKFollowPack();
            expect(fp.tagValue("d")).toBeUndefined();

            fp.tags.push(["d", "identifier-123"]);
            expect(fp.tagValue("d")).toBe("identifier-123");

            fp.removeTag("d");
            expect(fp.tagValue("d")).toBeUndefined();
        });

        describe("Image", () => {
            it("should get/set image with string URL", () => {
                const fp = new NDKFollowPack();
                fp.image = "https://example.com/image.png";
                expect(fp.image).toBe("https://example.com/image.png");
                expect(fp.tags.find((t) => t[0] === "image")).toEqual(["image", "https://example.com/image.png"]);
            });

            it("should get/set image with NDKImetaTag object", () => {
                const fp = new NDKFollowPack();
                fp.image = imetaObj;
                // Should set both imeta and image tags
                const imetaTag = fp.tags.find((t) => t[0] === "imeta");
                expect(imetaTag).toBeDefined();
                expect(mapImetaTag(imetaTag! as any).url).toBe(imetaObj.url);
                expect(fp.tags.find((t) => t[0] === "image")).toEqual(["image", imetaObj.url]);
            });

            it("should prefer imeta over image when both are present", () => {
                const fp = new NDKFollowPack();
                fp.image = "https://fallback.com/image.png";
                fp.image = imetaObj; // This sets both imeta and image tags
                expect(fp.image).toBe(imetaObj.url);
            });

            it("should remove both imeta and image tags when image is set to undefined", () => {
                const fp = new NDKFollowPack();
                fp.image = imetaObj;
                expect(fp.tags.find((t) => t[0] === "imeta")).toBeDefined();
                expect(fp.tags.find((t) => t[0] === "image")).toBeDefined();

                fp.image = undefined;
                expect(fp.tags.find((t) => t[0] === "imeta")).toBeUndefined();
                expect(fp.tags.find((t) => t[0] === "image")).toBeUndefined();
            });
        });

        it("should get/set pubkeys and manipulate p tags", () => {
            const fp = new NDKFollowPack();
            expect(fp.pubkeys).toEqual([]);

            fp.pubkeys = ["pk1", "pk2"];
            expect(fp.pubkeys).toEqual(["pk1", "pk2"]);
            expect(fp.tags.filter((t) => t[0] === "p").length).toBe(2);

            fp.pubkeys = [];
            expect(fp.pubkeys).toEqual([]);
            expect(fp.tags.find((t) => t[0] === "p")).toBeUndefined();
        });

        it("should get/set description", () => {
            const fp = new NDKFollowPack();
            expect(fp.description).toBeUndefined();

            fp.description = "A follow pack description";
            expect(fp.description).toBe("A follow pack description");
            expect(fp.tags.find((t) => t[0] === "description")).toEqual(["description", "A follow pack description"]);

            fp.description = undefined;
            expect(fp.description).toBeUndefined();
            expect(fp.tags.find((t) => t[0] === "description")).toBeUndefined();
        });
    });

    describe("Edge Cases", () => {
        it("should remove tags when setting undefined values", () => {
            const fp = new NDKFollowPack();
            fp.title = "Test";
            expect(fp.tags.find((t) => t[0] === "title")).toBeDefined();

            fp.title = undefined;
            expect(fp.tags.find((t) => t[0] === "title")).toBeUndefined();
        });

        it("should remove all p tags when setting pubkeys to empty array", () => {
            const fp = new NDKFollowPack();
            fp.pubkeys = ["pk1", "pk2"];
            expect(fp.tags.filter((t) => t[0] === "p").length).toBe(2);

            fp.pubkeys = [];
            expect(fp.tags.find((t) => t[0] === "p")).toBeUndefined();
        });

        it("should handle malformed or missing tags gracefully", () => {
            const fp = new NDKFollowPack();
            // Manually add malformed tags
            fp.tags.push(["p"]);
            fp.tags.push(["image"]);
            fp.tags.push(["imeta"]);
            fp.tags.push(["title"]);
            fp.tags.push(["description"]);

            // Getters should not throw and should return undefined or empty
            expect(fp.pubkeys).toEqual([]);
            expect(fp.image).toBeUndefined();
            expect(fp.title).toBeUndefined();
            expect(fp.description).toBeUndefined();
        });
    });
});
