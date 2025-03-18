import type { NDK } from "../../../ndk/index.js";
import type { NDKSigner } from "../../../signers/index.js";
import type { NDKUser } from "../../../user/index.js";
import type { NDKTag, NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import type { NDKDvmJobFeedbackStatus } from "./feedback.js";
import { NDKDVMJobFeedback } from "./feedback.js";
// import type { NDKDvmJobFeedbackStatus } from "./NDKDVMJobFeedback.js";
// import { NDKDVMJobFeedback } from "./NDKDVMJobFeedback.js";
// import { NDKDVMJobResult } from "./NDKDVMJobResult.js";

/**
 * NIP-90: Data vending machine request
 *
 * A generic Job request class for Data Vending Machines
 *
 * @example
 * const request = new NDKDVMRequest(ndk);
 * request.kind = NDKKind.DVMReqTextExtraction;
 * request.addInput(["https://allenfarrington.medium.com/modeling-bitcoin-value-with-vibes-99eca0997c5f", "url"])
 * await request.publish()
 */
export class NDKDVMRequest extends NDKEvent {
    constructor(ndk: NDK | undefined, event?: NostrEvent) {
        super(ndk, event);
    }

    static from(event: NDKEvent) {
        return new NDKDVMRequest(event.ndk, event.rawEvent());
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
        const paramTag = this.getMatchingTags("param").find((t: NDKTag) => t[1] === name);
        return paramTag ? paramTag[2] : undefined;
    }

    createFeedback(status: NDKDvmJobFeedbackStatus | string): NDKDVMJobFeedback {
        const feedback = new NDKDVMJobFeedback(this.ndk);
        feedback.tag(this, "job");
        feedback.status = status;
        return feedback;
    }

    /**
     * Enables job encryption for this event
     * @param dvm DVM that will receive the event
     * @param signer Signer to use for encryption
     */
    public async encryption(dvm: NDKUser, signer?: NDKSigner) {
        const dvmTags = ["i", "param", "output", "relays", "bid"];
        const tags = this.tags.filter((t) => dvmTags.includes(t[0]));

        // remove all tags that will be encrypted
        this.tags = this.tags.filter((t) => !dvmTags.includes(t[0]));
        this.content = JSON.stringify(tags);
        this.tag(dvm);
        this.tags.push(["encrypted"]);

        // encrypt the event
        await this.encrypt(dvm, signer);
    }

    /**
     * Sets the DVM that will receive the event
     */
    set dvm(dvm: NDKUser | undefined) {
        this.removeTag("p");

        if (dvm) this.tag(dvm);
    }
}
