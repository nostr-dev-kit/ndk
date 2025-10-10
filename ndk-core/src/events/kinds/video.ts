import type { NDK } from "../../ndk";
import type { NDKImetaTag } from "../../utils/imeta";
import { imetaTagToTag, mapImetaTag } from "../../utils/imeta";
import type { NostrEvent } from "..";
import { NDKEvent } from "..";
import type { ContentTag } from "../content-tagger";
import { NDKKind } from ".";

/**
 * Represents a horizontal or vertical video.
 * @group Kind Wrapper
 */
export class NDKVideo extends NDKEvent {
    static kind = NDKKind.Video;
    static kinds = [NDKKind.HorizontalVideo, NDKKind.VerticalVideo, NDKKind.ShortVideo, NDKKind.Video];
    private _imetas: NDKImetaTag[] | undefined;

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
        let thumbnail: string | undefined;
        if (this.imetas && this.imetas.length > 0) {
            thumbnail = this.imetas[0].image?.[0];
        }

        return thumbnail ?? this.tagValue("thumb");
    }

    get imetas(): NDKImetaTag[] {
        if (this._imetas) return this._imetas;
        this._imetas = this.tags.filter((tag) => tag[0] === "imeta").map(mapImetaTag);
        return this._imetas;
    }

    set imetas(tags: NDKImetaTag[]) {
        this._imetas = tags;

        this.tags = this.tags.filter((tag) => tag[0] !== "imeta");
        this.tags.push(...tags.map(imetaTagToTag));
    }

    get url(): string | undefined {
        if (this.imetas && this.imetas.length > 0) {
            return this.imetas[0].url;
        }

        return this.tagValue("url");
    }

    /**
     * Getter for the article's publication timestamp.
     *
     * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
     */
    get published_at(): number | undefined {
        const tag = this.tagValue("published_at");
        if (tag) {
            return Number.parseInt(tag);
        }
        return undefined;
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

        if (!this.kind) {
            if (this.imetas?.[0]?.dim) {
                const [width, height] = this.imetas[0].dim.split("x");
                const isPortrait = width && height && Number.parseInt(width) < Number.parseInt(height);
                const isShort = this.duration && this.duration < 120;
                if (isShort && isPortrait) this.kind = NDKKind.ShortVideo;
                else this.kind = NDKKind.Video;
            }
        }

        return super.generateTags();
    }

    get duration(): number | undefined {
        const tag = this.tagValue("duration");
        if (tag) {
            return Number.parseInt(tag);
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
