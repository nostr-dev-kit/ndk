import type { NostrEvent } from "../../index.js";
import type { NDK } from "../../ndk/index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";
import type { NDKProject } from "./project.js";

/**
 * Represents a task associated with a project.
 * Tasks are regular events with kind 1934.
 */
export class NDKTask extends NDKEvent {
    static kind = NDKKind.Task;
    static kinds = [NDKKind.Task];

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind = NDKKind.Task;
    }

    static from(event: NDKEvent): NDKTask {
        return new NDKTask(event.ndk, event.rawEvent());
    }

    set title(value: string) {
        this.removeTag("title");
        if (value) this.tags.push(["title", value]);
    }

    get title(): string | undefined {
        return this.tagValue("title");
    }

    set project(project: NDKProject) {
        this.removeTag("a");
        this.tags.push(project.tagReference());
    }

    get projectSlug(): string | undefined {
        const tag = this.getMatchingTags("a")[0];
        return tag ? tag[1].split(/:/)?.[2] : undefined;
    }
}
