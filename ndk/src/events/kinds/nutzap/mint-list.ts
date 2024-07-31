import type { NDK } from "../../../ndk/index.js";
import { NDKRelaySet } from "../../../relay/sets/index.js";
import type { NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";

export class NDKCashuMintList extends NDKEvent {
    static kind = NDKKind.CashuMintList;
    static kinds = [NDKKind.CashuMintList];
    private _p2pkPubkey?: string;

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuMintList;
    }

    static from(event: NDKEvent) {
        return new NDKCashuMintList(event.ndk, event);
    }

    set relays(urls: WebSocket["url"][]) {
        this.tags = this.tags.filter((t) => t[0] !== "relay");
        for (const url of urls) {
            this.tags.push(["relay", url]);
        }
    }

    get relays(): WebSocket["url"][] {
        const r = [];
        for (const tag of this.tags) {
            if (tag[0] === "relay") {
                r.push(tag[1]);
            }
        }

        return r;
    }

    set mints(urls: WebSocket["url"][]) {
        this.tags = this.tags.filter((t) => t[0] !== "mint");
        for (const url of urls) {
            this.tags.push(["mint", url]);
        }
    }

    get mints(): WebSocket["url"][] {
        const r = [];
        for (const tag of this.tags) {
            if (tag[0] === "mint") {
                r.push(tag[1]);
            }
        }

        return Array.from(new Set(r));
    }

    get p2pkPubkey(): string {
        if (this._p2pkPubkey) {
            return this._p2pkPubkey;
        }
        this._p2pkPubkey = this.tagValue("pubkey") ?? this.pubkey;
        return this._p2pkPubkey;
    }

    set p2pkPubkey(pubkey: string | undefined) {
        this._p2pkPubkey = pubkey;
        this.removeTag("pubkey");
        if (pubkey) {
            this.tags.push(["pubkey", pubkey]);
        }
    }

    get relaySet(): NDKRelaySet | undefined {
        return NDKRelaySet.fromRelayUrls(this.relays, this.ndk!);
    }
}
