import { nip19 } from "nostr-tools";
import NDKEvent from ".";

export function encode(this: NDKEvent) {
    if (this.isParamReplaceable()) {
        return nip19.naddrEncode({
            kind: this.kind as number,
            pubkey: this.pubkey,
            identifier: this.replaceableDTag(),
            relays: this.relay ? [this.relay.url] : [],
        });
    } else if (this.relay) {
        return nip19.neventEncode({
            id: this.tagId(),
            relays: [this.relay.url],
            author: this.pubkey,
        });
    } else {
        return nip19.noteEncode(this.tagId());
    }
}
