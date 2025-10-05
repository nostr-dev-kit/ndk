import { describe, it, expect, beforeEach } from "vitest";
import { NDKSvelte } from "./ndk-svelte";

describe("NDKSvelte", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = new NDKSvelte();
    });

    it("should extend NDK", () => {
        expect(ndk).toBeInstanceOf(NDKSvelte);
    });
});
