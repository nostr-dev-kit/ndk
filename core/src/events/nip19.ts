import { nip19 } from "nostr-tools";

import type { NDKEvent } from "./index.js";

const DEFAULT_RELAY_COUNT = 2 as const;

export function encode(this: NDKEvent, maxRelayCount: number = DEFAULT_RELAY_COUNT): string {
    let relays: string[] = [];

    if (this.onRelays.length > 0) {
        relays = this.onRelays.map((relay) => relay.url);
    } else if (this.relay) {
        relays = [this.relay.url];
    }

    if (relays.length > maxRelayCount) {
        relays = relays.slice(0, maxRelayCount);
    }

    if (this.isParamReplaceable()) {
        return nip19.naddrEncode({
            kind: this.kind as number,
            pubkey: this.pubkey,
            identifier: this.replaceableDTag(),
            relays,
        });
    }
    if (relays.length > 0) {
        return nip19.neventEncode({
            id: this.tagId(),
            relays,
            author: this.pubkey,
        });
    }
    return nip19.noteEncode(this.tagId());
}
