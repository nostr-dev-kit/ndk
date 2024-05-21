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

    static async from(event: NDKEvent) {
        try {
            const e = new NDKDVMEventSchedule(event.ndk, event.rawEvent());
            const serviceProvider = new NDKUser({
                pubkey: event.tagValue("p"),
            });
            await e.decrypt(serviceProvider);
            return e;
        } catch (error) {
            console.error({ error });
        }
    }

    async dvmDecrypt() {
        await this.decrypt();
        const decryptedContent = JSON.parse(this.content);
        this.tags.push(...decryptedContent);
    }
}
