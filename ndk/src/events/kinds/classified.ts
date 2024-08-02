import type { NDK } from "../../ndk/index.js";
import type { ContentTag } from "../content-tagger.js";
import { NDKEvent } from "../index.js";
import type { NostrEvent } from "../index.js";
import type { NDKTag } from "../index.js";
import { NDKKind } from "./index.js";

interface NDKClassifiedPriceTag {
    amount: number;
    currency?: string;
    frequency?: string;
}

/**
 * Represents a NIP-99 Classified Listing.
 *
 * @group Kind Wrapper
 */
export class NDKClassified extends NDKEvent {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Classified;
    }

    /**
     * Creates a NDKClassified from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKClassified from.
     * @returns NDKClassified
     */
    static from(event: NDKEvent): NDKClassified {
        return new NDKClassified(event.ndk, event);
    }

    /**
     * Getter for the classified title.
     *
     * @returns {string | undefined} - The classified title if available, otherwise undefined.
     */
    get title(): string | undefined {
        return this.tagValue("title");
    }

    /**
     * Setter for the classified title.
     *
     * @param {string | undefined} title - The title to set for the classified.
     */
    set title(title: string | undefined) {
        this.removeTag("title");

        if (title) this.tags.push(["title", title]);
    }

    /**
     * Getter for the classified summary.
     *
     * @returns {string | undefined} - The classified summary if available, otherwise undefined.
     */
    get summary(): string | undefined {
        return this.tagValue("summary");
    }

    /**
     * Setter for the classified summary.
     *
     * @param {string | undefined} summary - The summary to set for the classified.
     */
    set summary(summary: string | undefined) {
        this.removeTag("summary");

        if (summary) this.tags.push(["summary", summary]);
    }

    /**
     * Getter for the classified's publication timestamp.
     *
     * @returns {number | undefined} - The Unix timestamp of when the classified was published or undefined.
     */
    get published_at(): number | undefined {
        const tag = this.tagValue("published_at");

        if (tag) {
            return parseInt(tag);
        }

        return undefined;
    }

    /**
     * Setter for the classified's publication timestamp.
     *
     * @param {number | undefined} timestamp - The Unix timestamp to set for the classified's publication date.
     */
    set published_at(timestamp: number | undefined) {
        this.removeTag("published_at");

        if (timestamp !== undefined) {
            this.tags.push(["published_at", timestamp.toString()]);
        }
    }

    /**
     * Getter for the classified location.
     *
     * @returns {string | undefined} - The classified location if available, otherwise undefined.
     */
    get location(): string | undefined {
        return this.tagValue("location");
    }

    /**
     * Setter for the classified location.
     *
     * @param {string | undefined} location - The location to set for the classified.
     */
    set location(location: string | undefined) {
        this.removeTag("location");

        if (location) this.tags.push(["location", location]);
    }

    /**
     * Getter for the classified price.
     *
     * @returns {NDKClassifiedPriceTag | undefined} - The classified price if available, otherwise undefined.
     */
    get price(): NDKClassifiedPriceTag | undefined {
        const priceTag = this.tags.find((tag) => tag[0] === "price");
        if (priceTag) {
            return {
                amount: parseFloat(priceTag[1]),
                currency: priceTag[2],
                frequency: priceTag[3],
            };
        } else {
            return undefined;
        }
    }

    /**
     * Setter for the classified price.
     *
     * @param price - The price to set for the classified.
     */
    set price(priceTag: NDKClassifiedPriceTag | string | undefined) {
        if (typeof priceTag === "string") {
            priceTag = {
                amount: parseFloat(priceTag),
            };
        }

        if (priceTag?.amount) {
            const tag: NDKTag = ["price", priceTag.amount.toString()];
            if (priceTag.currency) tag.push(priceTag.currency);
            if (priceTag.frequency) tag.push(priceTag.frequency);

            this.tags.push(tag);
        } else {
            this.removeTag("price");
        }
    }

    /**
     * Generates content tags for the classified.
     *
     * This method first checks and sets the publication date if not available,
     * and then generates content tags based on the base NDKEvent class.
     *
     * @returns {ContentTag} - The generated content tags.
     */
    async generateTags(): Promise<ContentTag> {
        super.generateTags();

        if (!this.published_at) {
            this.published_at = this.created_at;
        }

        return super.generateTags();
    }
}
