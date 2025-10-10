import { NDKEvent } from "../index.js";
import { NDKKind } from ".";
import { NDKArticle } from "./article";

/**
 * Represents a NIP-54 wiki event.
 *
 * Wiki events use
 */
export class NDKWiki extends NDKArticle {
    static kind = NDKKind.Wiki;
    static kinds = [NDKKind.Wiki];

    static from(event: NDKEvent) {
        return new NDKWiki(event.ndk, event.rawEvent());
    }

    get isDefered(): boolean {
        return this.hasTag("a", "defer");
    }

    get deferedId(): string | undefined {
        return this.tagValue("a", "defer");
    }

    /**
     * Defers the author's wiki event to another wiki event.
     *
     * Wiki-events can tag other wiki-events with a `defer` marker to indicate that it considers someone else's entry as a "better" version of itself. If using a `defer` marker both `a` and `e` tags SHOULD be used.
     *
     * @example
     * myWiki.defer = betterWikiEntryOnTheSameTopic;
     * myWiki.publishReplaceable()
     */
    set defer(deferedTo: NDKWiki) {
        this.removeTag("a", "defer");
        this.tag(deferedTo, "defer");
    }
}

/**
 * Represents a NIP-54 wiki merge request event.
 *
 * Users can request other users to get their entries merged into someone else's entry by creating a `kind:818` event.
 */
export class NDKWikiMergeRequest extends NDKEvent {
    static kind = NDKKind.WikiMergeRequest;
    static kinds = [NDKKind.WikiMergeRequest];

    static from(event: NDKEvent) {
        return new NDKWikiMergeRequest(event.ndk, event.rawEvent());
    }

    /**
     * The target ID (<kind:pubkey:d-tag>) of the wiki event to merge into.
     */
    get targetId(): string | undefined {
        return this.tagValue("a");
    }

    /**
     * Sets the target ID (<kind:pubkey:d-tag>) of the wiki event to merge into.
     */
    set target(targetEvent: NDKWiki) {
        this.tags = this.tags.filter((tag) => {
            if (tag[0] === "a") return true;
            if (tag[0] === "e" && tag[3] !== "source") return true;
        });

        this.tag(targetEvent);
    }

    /**
     * The source ID of the wiki event to merge from.
     */
    get sourceId(): string | undefined {
        return this.tagValue("e", "source");
    }

    /**
     * Sets the event we are asking to get merged into the target.
     */
    set source(sourceEvent: NDKWiki) {
        this.removeTag("e", "source");

        this.tag(sourceEvent, "source", false, "e");
    }
}
