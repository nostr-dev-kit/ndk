import { NDKEvent, NostrEvent } from "../../index.js";
import { NDK } from "../../../ndk/index.js";
import { NDKKind } from "../index.js";
import { NDKUser } from "../../../user/index.js";

export class NDKDVMEventSchedule extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind = NDKKind.DVMEventSchedule;
    }

    static async from(event: NDKEvent) {
        const e = new NDKDVMEventSchedule(event.ndk, event.rawEvent());
        const serviceProvider = new NDKUser({
            pubkey: event.tagValue("p")
        });
        await e.decrypt(serviceProvider);
        return e;
    }

    async dvmDecrypt() {
        await this.decrypt();
        const decryptedContent = JSON.parse(this.content);
        this.tags.push(...decryptedContent);
    }
}