import type { NDKTag } from "../events";
import { imetaTagToTag, mapImetaTag, type NDKImetaTag } from "./imeta";

describe("mapImetaTag", () => {
    test("should map a single key-value pair correctly", () => {
        const tag: NDKTag = ["imeta", "url https://example.com"];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = { url: "https://example.com" };
        expect(result).toEqual(expected);
    });

    test("should map multiple key-value pairs correctly", () => {
        const tag: NDKTag = ["imeta", "url https://example.com alt example dim 800x600"];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = {
            url: "https://example.com",
            alt: "example",
            dim: "800x600",
        };
        expect(result).toEqual(expected);
    });

    test("should handle fallback as an array", () => {
        const tag: NDKTag = ["imeta", "fallback https://fallback1.com fallback https://fallback2.com"];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = {
            fallback: ["https://fallback1.com", "https://fallback2.com"],
        };
        expect(result).toEqual(expected);
    });

    test("should handle mixed key-value pairs with fallbacks", () => {
        const tag: NDKTag = ["imeta", "url https://example.com fallback https://fallback1.com alt image"];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = {
            url: "https://example.com",
            alt: "image",
            fallback: ["https://fallback1.com"],
        };
        expect(result).toEqual(expected);
    });

    test("should return an empty object for an empty tag", () => {
        const tag: NDKTag = [];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = {};
        expect(result).toEqual(expected);
    });

    test("should handle unexpected keys gracefully", () => {
        const tag: NDKTag = ["imeta", "unknownKey someValue"];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = { unknownKey: "someValue" } as any;
        expect(result).toEqual(expected);
    });

    test("should process duplicate keys and overwrite previous values", () => {
        const tag: NDKTag = ["imeta", "url https://example.com", "url https://newurl.com"];
        const result = mapImetaTag(tag);
        const expected: NDKImetaTag = {
            url: "https://newurl.com",
        };
        expect(result).toEqual(expected);
    });
});

describe("exampleFunction", () => {
    it("should return the expected result for valid input", () => {
        const input: NDKImetaTag = {
            url: "https://example.com",
            alt: "example",
            dim: "800x600",
        };
        const expectedOutput: NDKTag = ["imeta", "url https://example.com", "alt example", "dim 800x600"];
        const result = imetaTagToTag(input);
        expect(result).toEqual(expectedOutput);
    });

    it("should handle edge case correctly", () => {
        const edgeCaseInput: NDKImetaTag = {
            url: "https://example.com",
            alt: "example",
            dim: "800x600",
            fallback: ["https://fallback1.com", "https://fallback2.com"],
        };
        const expectedOutput: NDKTag = [
            "imeta",
            "url https://example.com",
            "alt example",
            "dim 800x600",
            "fallback https://fallback1.com",
            "fallback https://fallback2.com",
        ];
        const result = imetaTagToTag(edgeCaseInput);
        expect(result).toEqual(expectedOutput);
    });

    // Add more test cases as needed
});
