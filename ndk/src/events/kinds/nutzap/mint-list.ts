import type { NDK } from "../../../ndk/index.js";
import { NDKRelaySet } from "../../../relay/sets/index.js";
import type { NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";

export class NDKCashuMintList extends NDKEvent {
    static kind = NDKKind.CashuMintList;
    static kinds = [NDKKind.CashuMintList];
    private _p2pk?: string;

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

    get p2pk(): string {
        if (this._p2pk) {
            return this._p2pk;
        }
        this._p2pk = this.tagValue("pubkey") ?? this.pubkey;
        return this._p2pk;
    }

    set p2pk(pubkey: string | undefined) {
        this._p2pk = pubkey;
        this.removeTag("pubkey");
        if (pubkey) {
            this.tags.push(["pubkey", pubkey]);
        }
    }

    get relaySet(): NDKRelaySet | undefined {
        return NDKRelaySet.fromRelayUrls(this.relays, this.ndk!);
    }
}
