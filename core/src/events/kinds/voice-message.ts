import type { NDK } from "../../ndk/index.js";
import { NDKEvent, type NostrEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a NIP-A0 voice message (kind 1222).
 *
 * @group Kind Wrapper
 */
export class NDKVoiceMessage extends NDKEvent {
    static kind = NDKKind.VoiceMessage;
    static kinds = [NDKKind.VoiceMessage];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.VoiceMessage;
    }

    /**
     * Creates a NDKVoiceMessage from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKVoiceMessage from.
     * @returns NDKVoiceMessage
     */
    static from(event: NDKEvent) {
        return new NDKVoiceMessage(event.ndk, event);
    }

    /**
     * Getter for the audio URL.
     *
     * @returns {string | undefined} - The audio file URL if available, otherwise undefined.
     */
    get url(): string | undefined {
        return this.content || undefined;
    }

    /**
     * Setter for the audio URL.
     *
     * @param {string | undefined} url - The audio URL to set for the voice message.
     */
    set url(url: string | undefined) {
        this.content = url || "";
    }

    /**
     * Getter for the waveform data from imeta tag.
     *
     * @returns {number[] | undefined} - Array of amplitude values if available, otherwise undefined.
     */
    get waveform(): number[] | undefined {
        const imetaTag = this.tags.find(tag => tag[0] === "imeta");
        if (!imetaTag) return undefined;

        const waveformValue = imetaTag.find(value => value.startsWith("waveform "));
        if (!waveformValue) return undefined;

        const waveformStr = waveformValue.replace("waveform ", "");
        return waveformStr.split(" ").map(v => parseInt(v, 10));
    }

    /**
     * Setter for the waveform data in imeta tag.
     *
     * @param {number[] | undefined} waveform - Array of amplitude values (0-100).
     */
    set waveform(waveform: number[] | undefined) {
        this.removeTag("imeta");

        if (waveform && waveform.length > 0) {
            const imetaTag = ["imeta", `url ${this.content}`];
            imetaTag.push(`waveform ${waveform.join(" ")}`);

            const duration = this.duration;
            if (duration !== undefined) {
                imetaTag.push(`duration ${duration}`);
            }

            this.tags.push(imetaTag);
        }
    }

    /**
     * Getter for the audio duration in seconds from imeta tag.
     *
     * @returns {number | undefined} - The audio duration in seconds if available, otherwise undefined.
     */
    get duration(): number | undefined {
        const imetaTag = this.tags.find(tag => tag[0] === "imeta");
        if (!imetaTag) return undefined;

        const durationValue = imetaTag.find(value => value.startsWith("duration "));
        if (!durationValue) return undefined;

        const durationStr = durationValue.replace("duration ", "");
        return parseInt(durationStr, 10);
    }

    /**
     * Setter for the audio duration in imeta tag.
     *
     * @param {number | undefined} duration - The audio duration in seconds.
     */
    set duration(duration: number | undefined) {
        const existingImeta = this.tags.find(tag => tag[0] === "imeta");

        if (duration !== undefined) {
            if (existingImeta) {
                const durationIndex = existingImeta.findIndex(v => v.startsWith("duration "));
                if (durationIndex > 0) {
                    existingImeta[durationIndex] = `duration ${duration}`;
                } else {
                    existingImeta.push(`duration ${duration}`);
                }
            } else {
                const imetaTag = ["imeta", `url ${this.content}`, `duration ${duration}`];
                this.tags.push(imetaTag);
            }
        } else if (existingImeta) {
            const filtered = existingImeta.filter(v => !v.startsWith("duration "));
            if (filtered.length <= 1) {
                this.removeTag("imeta");
            } else {
                const index = this.tags.indexOf(existingImeta);
                this.tags[index] = filtered;
            }
        }
    }
}

/**
 * Represents a NIP-A0 voice reply (kind 1244).
 *
 * @group Kind Wrapper
 */
export class NDKVoiceReply extends NDKEvent {
    static kind = NDKKind.VoiceReply;
    static kinds = [NDKKind.VoiceReply];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.VoiceReply;
    }

    /**
     * Creates a NDKVoiceReply from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKVoiceReply from.
     * @returns NDKVoiceReply
     */
    static from(event: NDKEvent) {
        return new NDKVoiceReply(event.ndk, event);
    }

    /**
     * Getter for the audio URL.
     *
     * @returns {string | undefined} - The audio file URL if available, otherwise undefined.
     */
    get url(): string | undefined {
        return this.content || undefined;
    }

    /**
     * Setter for the audio URL.
     *
     * @param {string | undefined} url - The audio URL to set for the voice reply.
     */
    set url(url: string | undefined) {
        this.content = url || "";
    }

    /**
     * Getter for the waveform data from imeta tag.
     *
     * @returns {number[] | undefined} - Array of amplitude values if available, otherwise undefined.
     */
    get waveform(): number[] | undefined {
        const imetaTag = this.tags.find(tag => tag[0] === "imeta");
        if (!imetaTag) return undefined;

        const waveformValue = imetaTag.find(value => value.startsWith("waveform "));
        if (!waveformValue) return undefined;

        const waveformStr = waveformValue.replace("waveform ", "");
        return waveformStr.split(" ").map(v => parseInt(v, 10));
    }

    /**
     * Setter for the waveform data in imeta tag.
     *
     * @param {number[] | undefined} waveform - Array of amplitude values (0-100).
     */
    set waveform(waveform: number[] | undefined) {
        this.removeTag("imeta");

        if (waveform && waveform.length > 0) {
            const imetaTag = ["imeta", `url ${this.content}`];
            imetaTag.push(`waveform ${waveform.join(" ")}`);

            const duration = this.duration;
            if (duration !== undefined) {
                imetaTag.push(`duration ${duration}`);
            }

            this.tags.push(imetaTag);
        }
    }

    /**
     * Getter for the audio duration in seconds from imeta tag.
     *
     * @returns {number | undefined} - The audio duration in seconds if available, otherwise undefined.
     */
    get duration(): number | undefined {
        const imetaTag = this.tags.find(tag => tag[0] === "imeta");
        if (!imetaTag) return undefined;

        const durationValue = imetaTag.find(value => value.startsWith("duration "));
        if (!durationValue) return undefined;

        const durationStr = durationValue.replace("duration ", "");
        return parseInt(durationStr, 10);
    }

    /**
     * Setter for the audio duration in imeta tag.
     *
     * @param {number | undefined} duration - The audio duration in seconds.
     */
    set duration(duration: number | undefined) {
        const existingImeta = this.tags.find(tag => tag[0] === "imeta");

        if (duration !== undefined) {
            if (existingImeta) {
                const durationIndex = existingImeta.findIndex(v => v.startsWith("duration "));
                if (durationIndex > 0) {
                    existingImeta[durationIndex] = `duration ${duration}`;
                } else {
                    existingImeta.push(`duration ${duration}`);
                }
            } else {
                const imetaTag = ["imeta", `url ${this.content}`, `duration ${duration}`];
                this.tags.push(imetaTag);
            }
        } else if (existingImeta) {
            const filtered = existingImeta.filter(v => !v.startsWith("duration "));
            if (filtered.length <= 1) {
                this.removeTag("imeta");
            } else {
                const index = this.tags.indexOf(existingImeta);
                this.tags[index] = filtered;
            }
        }
    }
}
