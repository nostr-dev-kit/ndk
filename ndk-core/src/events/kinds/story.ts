import type { NDK } from "../../ndk/index.js";
import type { NDKUser } from "../../user/index.js";
import { imetaTagToTag, mapImetaTag, type NDKImetaTag } from "../../utils/imeta.js";
import type { ContentTag } from "../content-tagger.js";
import { NDKEvent, type NDKTag, type NostrEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Sticker type for NDKStory
 */
export enum NDKStoryStickerType {
    Pubkey = "pubkey",
    Event = "event",
    Prompt = "prompt",
    Text = "text",
    Countdown = "countdown",
}

/**
 * Interface representing a sticker position
 */
export interface NDKStickerPosition {
    x: number;
    y: number;
}

/**
 * Interface representing sticker dimensions
 */
export interface StickerDimension {
    width: number;
    height: number;
}

/**
 * Interface representing sticker properties
 */
export interface StickerProperties {
    [key: string]: string;
}

/**
 * Interface for a story sticker (used in tests and for the addSticker method)
 */
export interface StorySticker {
    type: NDKStoryStickerType;
    value: NDKEvent | NDKUser | string;
    position: NDKStickerPosition;
    dimension: StickerDimension;
    properties?: StickerProperties;
}

/**
 * Converts a string in the format "x,y" to a position object
 */
export function strToPosition(positionStr: string): NDKStickerPosition {
    const [x, y] = positionStr.split(",").map(Number);
    return { x, y };
}

/**
 * Converts a string in the format "widthxheight" to a dimension object
 */
export function strToDimension(dimensionStr: string): StickerDimension {
    const [width, height] = dimensionStr.split("x").map(Number);
    return { width, height };
}

/**
 * Maps sticker types to their value types
 */
export type StoryValueType<T extends NDKStoryStickerType> = T extends NDKStoryStickerType.Event
    ? NDKEvent
    : T extends NDKStoryStickerType.Pubkey
      ? NDKUser
      : string;

/**
 * Interface representing story dimensions
 */
export interface NDKStoryDimension {
    width: number;
    height: number;
}

/**
 * Represents a sticker in an NDK story.
 *
 * Example usage:
 * ```typescript
 * // Create a text sticker
 * const textSticker = new NDKStorySticker(NDKStoryStickerType.Text);
 * textSticker.value = "Hello World!";
 * textSticker.position = { x: 540, y: 960 };
 * textSticker.dimension = { width: 500, height: 150 };
 * textSticker.style = "bold";
 * textSticker.rotation = 15;
 *
 * // Create a mention sticker (Pubkey type)
 * const mentionSticker = new NDKStorySticker(NDKStoryStickerType.Pubkey);
 * mentionSticker.value = new NDKUser("pubkey-value");
 * mentionSticker.position = { x: 300, y: 500 };
 * mentionSticker.dimension = { width: 200, height: 50 };
 *
 * // Create a sticker from a tag
 * const tagSticker = new NDKStorySticker([
 *     "sticker",
 *     "event",
 *     "event-id",
 *     "540,960",
 *     "500x150",
 *     "style italic"
 * ]);
 * ```
 */
export class NDKStorySticker<T extends NDKStoryStickerType = NDKStoryStickerType> {
    static Text = NDKStoryStickerType.Text;
    static Pubkey = NDKStoryStickerType.Pubkey;
    static Event = NDKStoryStickerType.Event;
    static Prompt = NDKStoryStickerType.Prompt;
    static Countdown = NDKStoryStickerType.Countdown;

    readonly type: T;
    value: StoryValueType<T>;
    position: NDKStickerPosition;
    dimension: StickerDimension;
    properties?: StickerProperties;

    constructor(type: T);
    constructor(tag: NDKTag);
    constructor(arg: T | NDKTag) {
        if (Array.isArray(arg)) {
            // Initialized from tag
            const tag = arg;
            if (tag[0] !== "sticker" || tag.length < 5) {
                throw new Error("Invalid sticker tag");
            }

            this.type = tag[1] as T;
            this.value = tag[2] as StoryValueType<T>;
            this.position = strToPosition(tag[3]);
            this.dimension = strToDimension(tag[4]);

            const props: StickerProperties = {};
            for (let i = 5; i < tag.length; i++) {
                const [key, ...rest] = tag[i].split(" ");
                props[key] = rest.join(" ");
            }

            if (Object.keys(props).length > 0) {
                this.properties = props;
            }
        } else {
            // Initialized explicitly by type
            this.type = arg;
            this.value = undefined as any;
            this.position = { x: 0, y: 0 };
            this.dimension = { width: 0, height: 0 };
        }
    }

    static fromTag(tag: NDKTag): NDKStorySticker | null {
        try {
            return new NDKStorySticker(tag);
        } catch {
            return null;
        }
    }

    get style(): string | undefined {
        return this.properties?.style;
    }

    set style(style: string | undefined) {
        if (style) this.properties = { ...this.properties, style };
        else delete this.properties?.style;
    }

    get rotation(): number | undefined {
        return this.properties?.rot ? Number.parseFloat(this.properties.rot) : undefined;
    }

    set rotation(rotation: number | undefined) {
        if (rotation !== undefined) {
            this.properties = { ...this.properties, rot: rotation.toString() };
        } else {
            delete this.properties?.rot;
        }
    }

    /**
     * Checks if the sticker is valid.
     *
     * @returns {boolean} - True if the sticker is valid, false otherwise.
     */
    get isValid() {
        return this.hasValidDimensions() && this.hasValidPosition();
    }

    hasValidDimensions = () => {
        return (
            typeof this.dimension.width === "number" &&
            typeof this.dimension.height === "number" &&
            !Number.isNaN(this.dimension.width) &&
            !Number.isNaN(this.dimension.height)
        );
    };

    hasValidPosition = () => {
        return (
            typeof this.position.x === "number" &&
            typeof this.position.y === "number" &&
            !Number.isNaN(this.position.x) &&
            !Number.isNaN(this.position.y)
        );
    };

    toTag(): NDKTag {
        if (!this.isValid) {
            const errors = [
                !this.hasValidDimensions() ? "dimensions is invalid" : undefined,
                !this.hasValidPosition() ? "position is invalid" : undefined,
            ].filter(Boolean);

            throw new Error(`Invalid sticker: ${errors.join(", ")}`);
        }

        let value: string;

        switch (this.type) {
            case NDKStoryStickerType.Event:
                value = (this.value as NDKEvent).tagId();
                break;
            case NDKStoryStickerType.Pubkey:
                value = (this.value as NDKUser).pubkey;
                break;
            default:
                value = this.value as string;
        }

        const tag: NDKTag = ["sticker", this.type, value, coordinates(this.position), dimension(this.dimension)];

        if (this.properties) {
            for (const [key, propValue] of Object.entries(this.properties)) {
                tag.push(`${key} ${propValue}`);
            }
        }

        return tag;
    }
}

/**
 * Represents a NIP-XX Story.
 *
 * @group Kind Wrapper
 */
export class NDKStory extends NDKEvent {
    static kind = NDKKind.Story;
    static kinds = [NDKKind.Story];
    private _imeta: NDKImetaTag | undefined;
    private _dimensions: NDKStoryDimension | undefined;

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Story;

        // Load imeta if an event was passed in
        if (rawEvent) {
            for (const tag of rawEvent.tags) {
                switch (tag[0]) {
                    case "imeta":
                        this._imeta = mapImetaTag(tag);
                        break;
                    case "dim":
                        this.dimensions = strToDimension(tag[1]);
                        break;
                }
            }
        }
    }

    /**
     * Creates a NDKStory from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKStory from.
     * @returns NDKStory
     */
    static from(event: NDKEvent) {
        return new NDKStory(event.ndk, event);
    }

    /**
     * Checks if the story is valid (has exactly one imeta tag).
     */
    get isValid(): boolean {
        return !!this.imeta;
    }

    /**
     * Gets the first imeta tag (there should only be one).
     */
    get imeta(): NDKImetaTag | undefined {
        return this._imeta;
    }

    /**
     * Sets a single imeta tag, replacing any existing ones.
     */
    set imeta(tag: NDKImetaTag | undefined) {
        this._imeta = tag;

        // Update the tags array - remove all existing imeta tags
        this.tags = this.tags.filter((t) => t[0] !== "imeta");

        // Add the new imeta tag if provided
        if (tag) {
            this.tags.push(imetaTagToTag(tag));
        }
    }

    /**
     * Getter for the story dimensions.
     *
     * @returns {NDKStoryDimension | undefined} - The story dimensions if available, otherwise undefined.
     */
    get dimensions(): NDKStoryDimension | undefined {
        const dimTag = this.tagValue("dim");
        if (!dimTag) return undefined;

        return strToDimension(dimTag);
    }

    /**
     * Setter for the story dimensions.
     *
     * @param {NDKStoryDimension | undefined} dimensions - The dimensions to set for the story.
     */
    set dimensions(dimensions: NDKStoryDimension | undefined) {
        this.removeTag("dim");

        if (dimensions) {
            this.tags.push(["dim", `${dimensions.width}x${dimensions.height}`]);
        }
    }

    /**
     * Getter for the story duration.
     *
     * @returns {number | undefined} - The story duration in seconds if available, otherwise undefined.
     */
    get duration(): number | undefined {
        const durTag = this.tagValue("dur");
        if (!durTag) return undefined;

        return Number.parseInt(durTag);
    }

    /**
     * Setter for the story duration.
     *
     * @param {number | undefined} duration - The duration in seconds to set for the story.
     */
    set duration(duration: number | undefined) {
        this.removeTag("dur");

        if (duration !== undefined) {
            this.tags.push(["dur", duration.toString()]);
        }
    }

    /**
     * Gets all stickers from the story.
     *
     * @returns {NDKStorySticker[]} - Array of stickers in the story.
     */
    get stickers(): NDKStorySticker[] {
        const stickers: NDKStorySticker[] = [];

        for (const tag of this.tags) {
            if (tag[0] !== "sticker" || tag.length < 5) continue;

            const sticker = NDKStorySticker.fromTag(tag);
            if (sticker) stickers.push(sticker);
        }

        return stickers;
    }

    /**
     * Adds a sticker to the story.
     *
     * @param {NDKStorySticker|StorySticker} sticker - The sticker to add.
     */
    addSticker(sticker: NDKStorySticker | StorySticker): void {
        let stickerToAdd: NDKStorySticker;

        if (sticker instanceof NDKStorySticker) {
            stickerToAdd = sticker;
        } else {
            // Convert StorySticker interface to NDKStorySticker class
            const tag: NDKTag = [
                "sticker",
                sticker.type,
                typeof sticker.value === "string" ? sticker.value : "",
                coordinates(sticker.position),
                dimension(sticker.dimension),
            ];

            // Add properties if available
            if (sticker.properties) {
                for (const [key, value] of Object.entries(sticker.properties)) {
                    tag.push(`${key} ${value}`);
                }
            }

            stickerToAdd = new NDKStorySticker(tag);
            stickerToAdd.value = sticker.value as any;
        }

        // Add special tags for specific sticker types
        if (stickerToAdd.type === NDKStoryStickerType.Pubkey) {
            // Use tag() method for pubkey stickers
            this.tag(stickerToAdd.value as NDKUser);
        } else if (stickerToAdd.type === NDKStoryStickerType.Event) {
            // Instead of directly adding an 'e' tag, use the tag() method
            // This will handle both 'e' and 'a' tags appropriately
            this.tag(stickerToAdd.value as NDKEvent);
        }

        this.tags.push(stickerToAdd.toTag());
    }

    /**
     * Removes a sticker from the story.
     *
     * @param {number} index - The index of the sticker to remove.
     */
    removeSticker(index: number): void {
        const stickers = this.stickers;
        if (index < 0 || index >= stickers.length) return;

        // Find and remove the sticker tag
        let stickerCount = 0;
        for (let i = 0; i < this.tags.length; i++) {
            if (this.tags[i][0] === "sticker") {
                if (stickerCount === index) {
                    this.tags.splice(i, 1);
                    break;
                }
                stickerCount++;
            }
        }
    }
}

const coordinates = (position: NDKStickerPosition) => `${position.x},${position.y}`;
const dimension = (dimension: StickerDimension) => `${dimension.width}x${dimension.height}`;
