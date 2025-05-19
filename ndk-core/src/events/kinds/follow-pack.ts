import type { NDK } from "../../ndk/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";
import type { NDKImetaTag } from "../../utils/imeta.js";
import { imetaTagToTag, mapImetaTag } from "../../utils/imeta.js";

/**
 * Represents a FollowPack or MediaFollowPack event.
 * @group Kind Wrapper
 */
export class NDKFollowPack extends NDKEvent {
    static kind = NDKKind.FollowPack;
    static kinds = [NDKKind.FollowPack, NDKKind.MediaFollowPack];

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.FollowPack;
    }

    /**
     * Converts a generic NDKEvent to an NDKFollowPack.
     */
    static from(ndkEvent: NDKEvent): NDKFollowPack {
        return new NDKFollowPack(ndkEvent.ndk, ndkEvent.rawEvent());
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
        this.setTag("title", value);
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
    get pubkeys(): string[] {
        return this.tags.filter((tag) => tag[0] === "p" && typeof tag[1] === "string").map((tag) => tag[1]);
    }

    /**
     * Sets the pubkeys (replaces all p tags).
     */
    set pubkeys(pubkeys: string[]) {
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
        this.setTag("description", value);
    }

    /**
     * Helper to set or update a tag.
     */
    protected setTag(tagName: string, value: string | undefined) {
        this.tags = this.tags.filter((tag) => tag[0] !== tagName);
        if (value !== undefined) {
            this.tags.push([tagName, value]);
        }
    }
}
