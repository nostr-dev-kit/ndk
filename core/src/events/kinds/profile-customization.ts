import type { NDK } from "../../ndk/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Profile Hypercustomization as defined by NIP-F1 (kind:19999).
 *
 * Allows users to customize their profile with colors, background music,
 * priority kinds, and custom fields.
 *
 * @group Kind Wrapper
 */
export class NDKProfileCustomization extends NDKEvent {
    static kind = NDKKind.ProfileCustomization;
    static kinds = [NDKKind.ProfileCustomization];

    constructor(ndk?: NDK, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.ProfileCustomization;
    }

    /**
     * Creates an NDKProfileCustomization from an existing NDKEvent.
     */
    static from(event: NDKEvent): NDKProfileCustomization {
        return new NDKProfileCustomization(event.ndk, event);
    }

    /**
     * Gets the background color hex value for the profile page.
     */
    get backgroundColor(): string | undefined {
        return this.tagValue("background-color");
    }

    /**
     * Sets the background color hex value for the profile page.
     */
    set backgroundColor(value: string | undefined) {
        this.removeTag("background-color");
        if (value) this.tags.push(["background-color", value]);
    }

    /**
     * Gets the foreground color hex value for the profile page.
     */
    get foregroundColor(): string | undefined {
        return this.tagValue("foreground-color");
    }

    /**
     * Sets the foreground color hex value for the profile page.
     */
    set foregroundColor(value: string | undefined) {
        this.removeTag("foreground-color");
        if (value) this.tags.push(["foreground-color", value]);
    }

    /**
     * Gets the URL for background music that plays when the profile is opened.
     */
    get backgroundMusic(): string | undefined {
        return this.tagValue("background-music");
    }

    /**
     * Sets the URL for background music that plays when the profile is opened.
     */
    set backgroundMusic(value: string | undefined) {
        this.removeTag("background-music");
        if (value) this.tags.push(["background-music", value]);
    }

    /**
     * Gets the priority kinds that should be displayed by default on the profile.
     * Returns an array of kind numbers.
     */
    get priorityKinds(): number[] {
        const tag = this.getMatchingTags("priority_kinds")[0];
        if (!tag) return [];
        return tag.slice(1).map((k) => Number.parseInt(k, 10)).filter((k) => !Number.isNaN(k));
    }

    /**
     * Sets the priority kinds that should be displayed by default on the profile.
     */
    set priorityKinds(kinds: number[]) {
        this.removeTag("priority_kinds");
        if (kinds.length > 0) {
            this.tags.push(["priority_kinds", ...kinds.map((k) => k.toString())]);
        }
    }

    /**
     * Gets all custom profile fields as a Map of name to value.
     * Uses first-wins strategy for duplicate field names (consistent with getCustomField).
     */
    get customFields(): Map<string, string> {
        const customTags = this.getMatchingTags("custom");
        const map = new Map<string, string>();
        for (const tag of customTags) {
            if (tag[1] && tag[2] !== undefined && !map.has(tag[1])) {
                map.set(tag[1], tag[2]);
            }
        }
        return map;
    }

    /**
     * Sets a custom profile field. If value is undefined, removes the field.
     */
    setCustomField(name: string, value: string | undefined): void {
        // Remove existing custom tag with this name
        this.tags = this.tags.filter((tag) => !(tag[0] === "custom" && tag[1] === name));
        if (value !== undefined) {
            this.tags.push(["custom", name, value]);
        }
    }

    /**
     * Gets a specific custom field value by name.
     */
    getCustomField(name: string): string | undefined {
        const tag = this.tags.find((t) => t[0] === "custom" && t[1] === name);
        return tag?.[2];
    }
}
