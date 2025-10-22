import type { Hexpubkey } from "src/user/index.js";
import type { NDK } from "../../ndk/index.js";
import { isValidPubkey } from "../../utils/validation.js";
import type { NDKImetaTag } from "../../utils/imeta.js";
import { imetaTagToTag, mapImetaTag } from "../../utils/imeta.js";
import { NDKEvent, type NDKRawEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a FollowPack or MediaFollowPack event.
 * @group Kind Wrapper
 */
export class NDKFollowPack extends NDKEvent {
    static kind = NDKKind.FollowPack;
    static kinds = [NDKKind.FollowPack, NDKKind.MediaFollowPack];

    constructor(ndk?: NDK, rawEvent?: NDKEvent | NDKRawEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.FollowPack;
    }

    /**
     * Converts a generic NDKEvent to an NDKFollowPack.
     */
    static from(ndkEvent: NDKEvent): NDKFollowPack {
        return new NDKFollowPack(ndkEvent.ndk, ndkEvent);
    }

    /**
     * Gets the title from the tags.
     */
    get title(): string | undefined {
        return this.tagValue("title");
    }

    /**
     * Sets the title tag.
     */
    set title(value: string | undefined) {
        this.removeTag("title");
        if (value) this.tags.push(["title", value]);
    }

    /**
     * Gets the image URL from the tags.
     */
    /**
     * Gets the image URL from the tags.
     * Looks for an imeta tag first (returns its url), then falls back to the image tag.
     */
    get image(): string | undefined {
        // Look for an "imeta" tag first
        const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
        if (imetaTag) {
            const imeta = mapImetaTag(imetaTag);
            if (imeta.url) return imeta.url;
        }
        // Fallback to "image" tag
        return this.tagValue("image");
    }

    /**
     * Sets the image URL tag.
     */
    /**
     * Sets the image tag.
     * Accepts a string (URL) or an NDKImetaTag.
     * If given an NDKImetaTag, sets both the imeta tag and the image tag (using the url).
     * If undefined, removes both tags.
     */
    set image(value: string | NDKImetaTag | undefined) {
        // Remove existing "imeta" and "image" tags
        this.tags = this.tags.filter((tag) => tag[0] !== "imeta" && tag[0] !== "image");

        if (typeof value === "string") {
            if (value !== undefined) {
                this.tags.push(["image", value]);
            }
        } else if (value && typeof value === "object") {
            // Set imeta tag
            this.tags.push(imetaTagToTag(value));
            // Also set image tag if url is present
            if (value.url) {
                this.tags.push(["image", value.url]);
            }
        }
        // If value is undefined, both tags are already removed
    }

    /**
     * Gets all pubkeys from p tags.
     */
    get pubkeys(): Hexpubkey[] {
        return Array.from(
            new Set(this.tags.filter((tag) => tag[0] === "p" && tag[1] && isValidPubkey(tag[1])).map((tag) => tag[1])),
        );
    }

    /**
     * Sets the pubkeys (replaces all p tags).
     */
    set pubkeys(pubkeys: Hexpubkey[]) {
        this.tags = this.tags.filter((tag) => tag[0] !== "p");
        for (const pubkey of pubkeys) {
            this.tags.push(["p", pubkey]);
        }
    }

    /**
     * Gets the description from the tags.
     */
    get description(): string | undefined {
        return this.tagValue("description");
    }

    /**
     * Sets the description tag.
     */
    set description(value: string | undefined) {
        this.removeTag("description");
        if (value) this.tags.push(["description", value]);
    }
}
