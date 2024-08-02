import { nip19 } from "nostr-tools";

import type { NDK } from "../../ndk/index.js";
import type { NDKTag, NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKArticle } from "./article.js";
import { NDKKind } from "./index.js";

/**
 * Highlight as defined by NIP-84 (kind:9802).
 * @group Kind Wrapper
 */
export class NDKHighlight extends NDKEvent {
    private _article: NDKEvent | string | undefined;

    static kind = NDKKind.Highlight;
    static kinds = [NDKKind.Highlight];

    constructor(ndk?: NDK, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Highlight;
    }

    static from(event: NDKEvent) {
        return new NDKHighlight(event.ndk, event);
    }

    get url(): string | undefined {
        return this.tagValue("r");
    }

    /**
     * Context tag.
     */
    set context(context: string | undefined) {
        if (context === undefined) {
            this.tags = this.tags.filter(([tag, value]) => tag !== "context");
        } else {
            this.tags = this.tags.filter(([tag, value]) => tag !== "context");
            this.tags.push(["context", context]);
        }
    }

    get context(): string | undefined {
        return this.tags.find(([tag, value]) => tag === "context")?.[1] ?? undefined;
    }

    /**
     * Will return the article URL or NDKEvent if they have already been
     * set (it won't attempt to load remote events)
     */
    get article(): NDKEvent | string | undefined {
        return this._article;
    }

    /**
     * Article the highlight is coming from.
     *
     * @param article Article URL or NDKEvent.
     */
    set article(article: NDKEvent | string) {
        this._article = article;

        if (typeof article === "string") {
            this.tags.push(["r", article]);
        } else {
            this.tag(article);
        }
    }

    getArticleTag(): NDKTag | undefined {
        return (
            this.getMatchingTags("a")[0] ||
            this.getMatchingTags("e")[0] ||
            this.getMatchingTags("r")[0]
        );
    }

    async getArticle(): Promise<NDKArticle | NDKEvent | string | undefined> {
        if (this._article !== undefined) return this._article;

        // check for 'a' tag
        let taggedBech32: string | undefined;
        const articleTag = this.getArticleTag();

        if (!articleTag) return undefined;

        switch (articleTag[0]) {
            case "a":
                // eslint-disable-next-line no-case-declarations
                const [kind, pubkey, identifier] = articleTag[1].split(":");
                taggedBech32 = nip19.naddrEncode({ kind: parseInt(kind), pubkey, identifier });
                break;
            case "e":
                taggedBech32 = nip19.noteEncode(articleTag[1]);
                break;
            case "r":
                this._article = articleTag[1];
                break;
        }

        if (taggedBech32) {
            let a = await this.ndk?.fetchEvent(taggedBech32);
            if (a) {
                if (a.kind === NDKKind.Article) {
                    a = NDKArticle.from(a);
                }

                this._article = a;
            }
        }

        return this._article;
    }
}
