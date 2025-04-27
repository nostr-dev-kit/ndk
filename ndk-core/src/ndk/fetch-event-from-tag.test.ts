import { describe, it, expect, vi } from "vitest"; // Added vitest imports
import { NDK } from ".";
import { NDKEvent } from "../events";
import type { NDKSubscriptionOptions } from "../subscription";
import { NDKSubscriptionCacheUsage } from "../subscription";

const ndk = new NDK();

describe("fetchEventFromTag", () => {
    describe("with subOpts specifying only cache", () => {
        it("does not try to load a relay", async () => {
            const originalEvent = new NDKEvent();
            const tag = ["e", "id", "hint"];
            originalEvent.tags.push(tag);
            const subOpts: NDKSubscriptionOptions = {
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
            };
            vi.spyOn(ndk.pool, "getRelay");
            const _event = await ndk.fetchEventFromTag(tag, originalEvent, subOpts);
            expect(ndk.pool.getRelay).not.toHaveBeenCalled();
        });
    });
});
