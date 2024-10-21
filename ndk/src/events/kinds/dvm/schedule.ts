import type { NostrEvent } from "../../index.js";
import type { NDK } from "../../../ndk/index.js";
import { NDKKind } from "../index.js";
import { NDKEvent } from "../../index.js";
import { NDKUser } from "../../../user/index.js";

export class NDKDVMEventSchedule extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind = NDKKind.DVMEventSchedule;
    }

    static async from(event: NDKEvent): Promise<NDKDVMEventSchedule> {
        const e = new NDKDVMEventSchedule(event.ndk, event.rawEvent());
        if (e.encrypted) {
            const serviceProvider = new NDKUser({
                pubkey: event.tagValue("p"),
            });
            await e.decrypt(serviceProvider);
        }
        return e;
    }

    get encrypted(): boolean {
        return !!this.getMatchingTags("encrypted")[0];
    }

    static parseEventToPublish(scheduleEvent: NDKDVMEventSchedule): NDKEvent | undefined {
        const parsed = JSON.parse(scheduleEvent.content);
        const input = parsed.find((el: string[]) => el[0] === 'i');
        if (!input) return;

        const payload = JSON.parse(input[1]);
        return new NDKEvent(scheduleEvent.ndk, payload);
    }
}