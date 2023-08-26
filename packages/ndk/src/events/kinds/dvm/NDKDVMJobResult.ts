import NDK from "../../../index.js";
import NDKEvent, { NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * This event is published by Data Vending Machines when
 * they have finished processing a job.
 */
export class NDKDVMJobResult extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.DVMJobResult;
    }

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

    set jobRequest(event: NDKEvent | undefined) {
        this.removeTag("request");

        if (event) {
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
