import type { NDK } from "../../../ndk/index.js";
import type { NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * This event is published by Data Vending Machines when
 * they have finished processing a job.
 */
export class NDKDVMJobResult extends NDKEvent {
    static kind = 6000;
    static kinds = [
        6000, // DVMReqTextExtraction result
        6001, // DVMReqTextSummarization result
        6002, // DVMReqTextTranslation result
        6050, // DVMReqTextGeneration result
        6100, // DVMReqImageGeneration result
        6250, // DVMReqTextToSpeech result
        6300, // DVMReqDiscoveryNostrContent result
        6301, // DVMReqDiscoveryNostrPeople result
        6900, // DVMReqTimestamping result
        6905, // DVMEventSchedule result
    ];
    static from(event: NDKEvent) {
        return new NDKDVMJobResult(event.ndk, event.rawEvent());
    }

    setAmount(msat: number, invoice?: string) {
        this.removeTag("amount");

        const tag = ["amount", msat.toString()];
        if (invoice) tag.push(invoice);
        this.tags.push(tag);
    }

    set result(result: string | undefined) {
        if (result === undefined) {
            this.content = "";
        } else {
            this.content = result;
        }
    }

    get result(): string | undefined {
        if (this.content === "") {
            return undefined;
        }

        return this.content;
    }

    set status(status: string | undefined) {
        this.removeTag("status");

        if (status !== undefined) {
            this.tags.push(["status", status]);
        }
    }

    get status(): string | undefined {
        return this.tagValue("status");
    }

    get jobRequestId(): string | undefined {
        for (const eTag of this.getMatchingTags("e")) {
            if (eTag[2] === "job") return eTag[1];
        }

        if (this.jobRequest) return this.jobRequest.id;

        return this.tagValue("e");
    }

    set jobRequest(event: NDKEvent | undefined) {
        this.removeTag("request");

        if (event) {
            this.kind = event.kind! + 1000;
            this.tags.push(["request", JSON.stringify(event.rawEvent())]);
            this.tag(event);
        }
    }

    get jobRequest(): NDKEvent | undefined {
        const tag = this.tagValue("request");

        if (tag === undefined) {
            return undefined;
        }

        return new NDKEvent(this.ndk, JSON.parse(tag));
    }
}
