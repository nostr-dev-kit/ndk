import { nip19 } from "nostr-tools";

import type { NDKEvent } from "./index.js";

export function encode(this: NDKEvent): string {
    let relays: string[] = [];

    if (this.onRelays.length > 0) {
        relays = this.onRelays.map((relay) => relay.url);
    } else if (this.relay) {
        relays = [this.relay.url];
    }

    if (this.isParamReplaceable()) {
        return nip19.naddrEncode({
            kind: this.kind as number,
            pubkey: this.pubkey,
            identifier: this.replaceableDTag(),
            relays,
        });
    } else if (relays.length > 0) {
        return nip19.neventEncode({
            id: this.tagId(),
            relays,
            author: this.pubkey,
        });
    } else {
        return nip19.noteEncode(this.tagId());
    }
}
