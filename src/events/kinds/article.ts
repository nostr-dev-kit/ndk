import NDK from '../../index.js';
import NDKEvent, { type NostrEvent } from '../index.js';
import { NDKKind } from "./index.js";

/**
 * Represents a NIP-23 article.
 */
export class NDKArticle extends NDKEvent {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind = NDKKind.Article;
    }

    get title(): string | undefined {
        return this.tagValue('title');
    }

    set title(title: string | undefined) {
        if (title) {
            this.tags.push(['title', title]);
        } else {
            this.removeTag('title');
        }
    }

    get url(): string | undefined {
        return this.tagValue('url');
    }

    set url(url: string | undefined) {
        if (url) {
            this.tags.push(['url', url]);
        } else {
            this.removeTag('url');
        }
    }
}
