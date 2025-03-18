import type { NDK } from "../../../ndk/index.js";
import type { NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
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

    static async from(event: NDKEvent) {
        const e = new NDKDVMJobFeedback(event.ndk, event.rawEvent());

        if (e.encrypted) await e.dvmDecrypt();

        return e;
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

    get encrypted() {
        return !!this.getMatchingTags("encrypted")[0];
    }

    async dvmDecrypt() {
        await this.decrypt();
        const decryptedContent = JSON.parse(this.content);
        this.tags.push(...decryptedContent);
    }
}
