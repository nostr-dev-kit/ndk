import type { NDK } from "../../ndk/index.js";
import { NDKEvent, type NostrEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a NIP-7D Thread event.
 *
 * @group Kind Wrapper
 */
export class NDKThread extends NDKEvent {
    static kind = NDKKind.Thread;
    static kinds = [NDKKind.Thread];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Thread;
    }

    /**
     * Creates an NDKThread from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKThread from.
     * @returns NDKThread
     */
    static from(event: NDKEvent) {
        return new NDKThread(event.ndk, event);
    }

    /**
     * Gets the title of the thread.
     */
    get title(): string | undefined {
        return this.tagValue("title");
    }

    /**
     * Sets the title of the thread.
     */
    set title(title: string | undefined) {
        this.removeTag("title");
        if (title) {
            this.tags.push(["title", title]);
        }
    }
}
