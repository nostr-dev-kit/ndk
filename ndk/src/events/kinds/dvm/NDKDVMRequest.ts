import { NDK } from "../../../ndk/index.js";
import { NDKEvent, type NostrEvent, type NDKTag } from "../../index.js";
import {
    NDKDVMJobFeedback,
    type NDKDvmJobFeedbackStatus,
} from "./NDKDVMJobFeedback.js";
import { NDKDVMJobResult } from "./NDKDVMJobResult.js";

/**
 * NIP-90: Data vending machine
 *
 * A generic Job request class for Data Vending Machines
 */
export class NDKDVMRequest extends NDKEvent {
    constructor(ndk: NDK | undefined, event?: NostrEvent) {
        super(ndk, event);

        if (ndk) {
            this.tags.push(["relays", ...ndk.pool.urls()]);
        }
    }

    static from(event: NDKEvent) {
        return new NDKDVMRequest(event.ndk, event.rawEvent());
    }

    /**
     * Create a new job feedback for this request
     */
    public createFeedback(status: NDKDvmJobFeedbackStatus | string) {
        const feedback = new NDKDVMJobFeedback(this.ndk);
        feedback.status = status;
        feedback.tag(this, "job");

        return feedback;
    }

    /**
     * Create a new result event for this request
     */
    public createResult(data?: NostrEvent) {
        const event = new NDKDVMJobResult(this.ndk, data);
        event.jobRequest = this;

        return event;
    }

    set bid(msatAmount: number | undefined) {
        if (msatAmount === undefined) {
            this.removeTag("bid");
        } else {
            this.tags.push(["bid", msatAmount.toString()]);
        }
    }

    get bid(): number | undefined {
        const v = this.tagValue("bid");

        if (v === undefined) return undefined;

        return parseInt(v);
    }

    /**
     * Adds a new input to the job
     * @param args The arguments to the input
     */
    addInput(...args: string[]): void {
        this.tags.push(["i", ...args]);
    }

    /**
     * Adds a new parameter to the job
     */
    addParam(...args: string[]): void {
        this.tags.push(["param", ...args]);
    }

    set output(output: string | string[] | undefined) {
        if (output === undefined) {
            this.removeTag("output");
        } else {
            if (typeof output === "string") output = [output];
            this.tags.push(["output", ...output]);
        }
    }

    get output(): string[] | undefined {
        const outputTag = this.getMatchingTags("output")[0];
        return outputTag ? outputTag.slice(1) : undefined;
    }

    get params(): string[][] {
        const paramTags = this.getMatchingTags("param");
        return paramTags.map((t: NDKTag) => t.slice(1));
    }

    public getParam(name: string): string | undefined {
        const paramTag = this.getMatchingTags("param").find(
            (t: NDKTag) => t[1] === name
        );
        return paramTag ? paramTag[2] : undefined;
    }
}
