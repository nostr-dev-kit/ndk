import type { NDK } from "../../../ndk/index.js";
import type { NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";

export class NDKSimpleGroupMetadata extends NDKEvent {
    static kind = NDKKind.GroupMetadata;
    static kinds = [NDKKind.GroupMetadata];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.GroupMetadata;
    }

    static from(event: NDKEvent) {
        return new NDKSimpleGroupMetadata(event.ndk, event);
    }

    get name(): string | undefined {
        return this.tagValue("name");
    }

    get picture(): string | undefined {
        return this.tagValue("picture");
    }

    get about(): string | undefined {
        return this.tagValue("about");
    }

    get scope(): "public" | "private" | undefined {
        if (this.getMatchingTags("public").length > 0) return "public";
        if (this.getMatchingTags("public").length > 0) return "private";
        return undefined;
    }

    set scope(scope: "public" | "private" | undefined) {
        this.removeTag("public");
        this.removeTag("private");

        if (scope === "public") {
            this.tags.push(["public", ""]);
        } else if (scope === "private") {
            this.tags.push(["private", ""]);
        }
    }

    get access(): "open" | "closed" | undefined {
        if (this.getMatchingTags("open").length > 0) return "open";
        if (this.getMatchingTags("closed").length > 0) return "closed";
        return undefined;
    }

    set access(access: "open" | "closed" | undefined) {
        this.removeTag("open");
        this.removeTag("closed");

        if (access === "open") {
            this.tags.push(["open", ""]);
        } else if (access === "closed") {
            this.tags.push(["closed", ""]);
        }
    }
}
