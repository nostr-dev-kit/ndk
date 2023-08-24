import NDK from "../../../index.js";
import NDKEvent, { NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

export enum NDKDvmJobFeedbackStatus {
    Processing = "processing",
    Success = "success",
    Scheduled = "scheduled",
    PayReq = "payment_required",
}

export class NDKDVMJobFeedback extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.DVMJobFeedback;
    }

    static from(event: NDKEvent) {
        return new NDKDVMJobFeedback(event.ndk, event.rawEvent());
    }

    get status(): NDKDvmJobFeedbackStatus | string | undefined {
        return this.tagValue("status");
    }

    set status(status: NDKDvmJobFeedbackStatus | string | undefined) {
        this.removeTag("status");

        if (status !== undefined) {
            this.tags.push(["status", status]);
        }
    }
}
