import { EventEmitter } from "tseep";

import type { NDKEvent } from "../events/index.js";
import type { NDK } from "../ndk/index.js";
import type { Hexpubkey, NDKUser } from "../user/index.js";
import createDebug from "debug";
import type { NDKLnUrlData } from "../zapper/index.js";

const debug = createDebug("ndk:zap");

export type NDKZapType = "nip57" | "nip60";

export interface ZapConstructorParams {
    ndk: NDK;
    zappedEvent?: NDKEvent;
    /**
     * @deprecated use `recipient` instead
     */
    zappedUser?: NDKUser;
    recipient?: NDKUser;
    zapType?: NDKZapType;
    _fetch?: typeof fetch;
}

export class NDKZap extends EventEmitter {
    public ndk: NDK;
    public zappedEvent?: NDKEvent;
    public recipient: NDKUser;
    public zapType?: NDKZapType;
    private fetch: typeof fetch = fetch;

    /**
     * The maximum number of relays to request the zapper to publish the zap receipt to.
     */
    public maxRelays = 3;

    public constructor(args: ZapConstructorParams) {
        super();
        this.ndk = args.ndk;
        this.zappedEvent = args.zappedEvent;
        this.fetch = args._fetch || fetch;
        this.zapType = args.zapType ?? "nip57";

        this.recipient =
            args.recipient ||
            args.zappedUser ||
            this.ndk.getUser({ pubkey: this.zappedEvent?.pubkey });
    }

    /**
     * Fetches the zapper's pubkey for the zapped user
     */
    static async getZapperPubkey(ndk: NDK, forUser: Hexpubkey): Promise<Hexpubkey | undefined> {
        const recipient = ndk.getUser({ pubkey: forUser });
        const zap = new NDKZap({ ndk, recipient });
        const lnurlspec = await zap.getZapSpec();
        return lnurlspec?.nostrPubkey;
    }

    /**
     * @deprecated use `recipient` instead
     */
    get zappedUser(): NDKUser | undefined {
        return this.recipient;
    }

    public async getZapSpec(): Promise<NDKLnUrlData | undefined> {
        if (!this.recipient) throw new Error("No user to zap was provided");

        return this.recipient.getZapConfiguration(this.ndk);
    }

    public async getZapEndpoint(): Promise<string | undefined> {
        const zapSpec = await this.getZapSpec();
        if (!zapSpec) return;

        let zapEndpointCallback: string | undefined;

        if (zapSpec?.allowsNostr && (zapSpec?.nostrPubkey || zapSpec?.nostrPubkey)) {
            zapEndpointCallback = zapSpec.callback;
        }

        return zapEndpointCallback;
    }
}
