import { NDKKind } from ".";
import type { NostrEvent } from "..";
import { NDKEvent } from "..";
import type { NDK } from "../../ndk";
import type { ContentTag } from "../content-tagger";

/**
 * Represents a horizontal or vertical video.
 * @group Kind Wrapper
 */
export class NDKVideo extends NDKEvent {
    static kind = NDKKind.HorizontalVideo;
    static kinds = [NDKKind.HorizontalVideo, NDKKind.VerticalVideo];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.HorizontalVideo;
    }

    /**
     * Creates a NDKArticle from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKArticle from.
     * @returns NDKArticle
     */
    static from(event: NDKEvent) {
        return new NDKVideo(event.ndk, event.rawEvent());
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
     * Getter for the article thumbnail.
     *
     * @returns {string | undefined} - The article thumbnail if available, otherwise undefined.
     */
    get thumbnail(): string | undefined {
        return this.tagValue("thumb");
    }

    /**
     * Setter for the article thumbnail.
     *
     * @param {string | undefined} thumbnail - The thumbnail to set for the article.
     */
    set thumbnail(thumbnail: string | undefined) {
        this.removeTag("thumb");

        if (thumbnail) this.tags.push(["thumb", thumbnail]);
    }

    get url(): string | undefined {
        return this.tagValue("url");
    }

    set url(url: string | undefined) {
        this.removeTag("url");

        if (url) this.tags.push(["url", url]);
    }

    /**
     * Getter for the article's publication timestamp.
     *
     * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
     */
    get published_at(): number | undefined {
        const tag = this.tagValue("published_at");
        if (tag) {
            return parseInt(tag);
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

    get duration(): number | undefined {
        const tag = this.tagValue("duration");
        if (tag) {
            return parseInt(tag);
        }
        return undefined;
    }

    /**
     * Setter for the video's duration
     *
     * @param {number | undefined} duration - The duration to set for the video (in seconds)
     */
    set duration(dur: number | undefined) {
        this.removeTag("duration"); // Removes any existing "duration" tag.

        if (dur !== undefined) {
            this.tags.push(["duration", Math.floor(dur).toString()]);
        }
    }
}
