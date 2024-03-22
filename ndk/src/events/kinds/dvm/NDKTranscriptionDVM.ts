import { NDKKind } from "..";
import type { NDK } from "../../../ndk";
import type { NDKEvent, NostrEvent } from "../../index.js";
import { NDKDVMRequest } from "./request";

/**
 * NIP-90
 *
 * This class creates DVM transcription job types
 */
export class NDKTranscriptionDVM extends NDKDVMRequest {
    constructor(ndk: NDK | undefined, event?: NostrEvent) {
        super(ndk, event);
        this.kind = NDKKind.DVMReqTextExtraction;
    }

    static from(event: NDKEvent) {
        return new NDKTranscriptionDVM(event.ndk, event.rawEvent());
    }

    /**
     * Returns the original source of the transcription
     */
    get url(): string | undefined {
        const inputTags = this.getMatchingTags("i");

        if (inputTags.length !== 1) {
            return undefined;
        }

        return inputTags[0][1];
    }

    /**
     * Getter for the title tag
     */
    get title(): string | undefined {
        return this.tagValue("title");
    }

    /**
     * Setter for the title tag
     */
    set title(value: string | undefined) {
        this.removeTag("title");

        if (value) {
            this.tags.push(["title", value]);
        }
    }

    /**
     * Getter for the image tag
     */
    get image(): string | undefined {
        return this.tagValue("image");
    }

    /**
     * Setter for the image tag
     */
    set image(value: string | undefined) {
        this.removeTag("image");

        if (value) {
            this.tags.push(["image", value]);
        }
    }
}
