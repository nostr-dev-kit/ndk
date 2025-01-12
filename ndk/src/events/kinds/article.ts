import type { NDK } from "../../ndk/index.js";
import type { ContentTag } from "../content-tagger.js";
import { NDKEvent, type NostrEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a NIP-23 article.
 *
 * @group Kind Wrapper
 */
export class NDKArticle extends NDKEvent {
    static kind = NDKKind.Article;
    static kinds = [NDKKind.Article];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Article;
    }

    /**
     * Creates a NDKArticle from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKArticle from.
     * @returns NDKArticle
     */
    static from(event: NDKEvent) {
        return new NDKArticle(event.ndk, event);
    }

    /**
     * Getter for the article title.
     *
     * @returns {string | undefined} - The article title if available, otherwise undefined.
     */
    get title(): string | undefined {
        return this.tagValue("title");
    }

    /**
     * Setter for the article title.
     *
     * @param {string | undefined} title - The title to set for the article.
     */
    set title(title: string | undefined) {
        this.removeTag("title");

        if (title) this.tags.push(["title", title]);
    }

    /**
     * Getter for the article image.
     *
     * @returns {string | undefined} - The article image if available, otherwise undefined.
     */
    get image(): string | undefined {
        return this.tagValue("image");
    }

    /**
     * Setter for the article image.
     *
     * @param {string | undefined} image - The image to set for the article.
     */
    set image(image: string | undefined) {
        this.removeTag("image");

        if (image) this.tags.push(["image", image]);
    }

    get summary(): string | undefined {
        return this.tagValue("summary");
    }

    set summary(summary: string | undefined) {
        this.removeTag("summary");

        if (summary) this.tags.push(["summary", summary]);
    }

    /**
     * Getter for the article's publication timestamp.
     *
     * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
     */
    get published_at(): number | undefined {
        const tag = this.tagValue("published_at");
        if (tag) {
            let val = parseInt(tag);

            // if val is timestamp in milliseconds, convert to seconds
            if (val > 1000000000000) {
                val = Math.floor(val / 1000);
            }

            return val;
        }
        return undefined;
    }

    /**
     * Setter for the article's publication timestamp.
     *
     * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
     */
    set published_at(timestamp: number | undefined) {
        this.removeTag("published_at"); // Removes any existing "published_at" tag.

        if (timestamp !== undefined) {
            this.tags.push(["published_at", timestamp.toString()]);
        }
    }

    /**
     * Generates content tags for the article.
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

    /**
     * Getter for the article's URL.
     *
     * @returns {string | undefined} - The article's URL if available, otherwise undefined.
     */
    get url(): string | undefined {
        return this.tagValue("url");
    }

    /**
     * Setter for the article's URL.
     *
     * @param {string | undefined} url - The URL to set for the article.
     */
    set url(url: string | undefined) {
        if (url) {
            this.tags.push(["url", url]);
        } else {
            this.removeTag("url");
        }
    }
}
