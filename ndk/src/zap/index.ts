import { bech32 } from "@scure/base";
import { EventEmitter } from "tseep";
import { nip57 } from "nostr-tools";

import type { NostrEvent } from "../events/index.js";
import { NDKEvent, type NDKTag } from "../events/index.js";
import type { NDK } from "../ndk/index.js";
import type { NDKUser } from "../user/index.js";
import { NDKSigner } from "../signers/index.js";
import createDebug from "debug";
import { NDKUserProfile } from "../user/profile.js";

const debug = createDebug("ndk:zap");

const DEFAULT_RELAYS = [
    "wss://nos.lol",
    "wss://relay.nostr.band",
    "wss://relay.f7z.io",
    "wss://relay.damus.io",
    "wss://nostr.mom",
    "wss://no.str.cr",
];

interface ZapConstructorParams {
    ndk: NDK;
    zappedEvent?: NDKEvent;
    zappedUser?: NDKUser;
}

export default class Zap extends EventEmitter {
    public ndk: NDK;
    public zappedEvent?: NDKEvent;
    public zappedUser: NDKUser;

    public constructor(args: ZapConstructorParams) {
        super();
        this.ndk = args.ndk;
        this.zappedEvent = args.zappedEvent;

        this.zappedUser =
            args.zappedUser || this.ndk.getUser({ hexpubkey: this.zappedEvent?.pubkey });
    }

    public async getZapEndpoint(): Promise<string | undefined> {
        let lud06: string | undefined;
        let lud16: string | undefined;
        let zapEndpoint: string | undefined;
        let zapEndpointCallback: string | undefined;
        let profile: NDKUserProfile | undefined;

        if (this.zappedUser) {
            // check if user has a profile, otherwise request it
            if (!this.zappedUser.profile) {
                await this.zappedUser.fetchProfile({ groupable: false });
            }

            profile = this.zappedUser.profile;

            lud06 = (this.zappedUser.profile || {}).lud06;
            lud16 = (this.zappedUser.profile || {}).lud16;
        }

        if (lud16 && !lud16.startsWith("LNURL")) {
            const [name, domain] = lud16.split("@");
            zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
        } else if (lud06) {
            const { words } = bech32.decode(lud06, 1000);
            const data = bech32.fromWords(words);
            const utf8Decoder = new TextDecoder("utf-8");
            zapEndpoint = utf8Decoder.decode(data);
        }

        if (!zapEndpoint) {
            debug("No zap endpoint found", profile, { lud06, lud16 });
            throw new Error("No zap endpoint found");
        }

        try {
            const _fetch = this.ndk.httpFetch || fetch;
            const response = await _fetch(zapEndpoint);

            if (response.status !== 200) {
                const text = await response.text();
                throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
            }

            const body = await response.json();

            if (body?.allowsNostr && (body?.nostrPubkey || body?.nostrPubKey)) {
                zapEndpointCallback = body.callback;
            }

            return zapEndpointCallback;
        } catch (e) {
            throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${e}`);
            return;
        }
    }

    /**
     * Generates a kind:9734 zap request and returns the payment request
     * @param amount amount to zap in millisatoshis
     * @param comment optional comment to include in the zap request
     * @param extraTags optional extra tags to include in the zap request
     * @param relays optional relays to ask zapper to publish the zap to
     * @returns the payment request
     */
    public async createZapRequest(
        amount: number, // amount to zap in millisatoshis
        comment?: string,
        extraTags?: NDKTag[],
        relays?: string[],
        signer?: NDKSigner
    ): Promise<string | null> {
        const res = await this.generateZapRequest(amount, comment, extraTags, relays);
        if (!res) return null;
        const { event, zapEndpoint } = res;

        if (!event) {
            throw new Error("No zap request event found");
        }

        await event.sign(signer);

        let invoice: string | null;

        try {
            debug(`Getting invoice for zap request: ${zapEndpoint}`);
            invoice = await this.getInvoice(event, amount, zapEndpoint);
        } catch (e) {
            throw new Error("Failed to get invoice: " + e);
        }

        return invoice;
    }

    public async getInvoice(
        event: NDKEvent,
        amount: number,
        zapEndpoint: string
    ): Promise<string | null> {
        debug(
            `Fetching invoice from ${zapEndpoint}?` +
                new URLSearchParams({
                    amount: amount.toString(),
                    nostr: encodeURIComponent(JSON.stringify(event.rawEvent())),
                })
        );
        const url = new URL(zapEndpoint);
        url.searchParams.append("amount", amount.toString());
        url.searchParams.append("nostr", JSON.stringify(event.rawEvent()));
        debug(`Fetching invoice from ${url.toString()}`);
        const response = await fetch(url.toString());
        debug(`Got response from zap endpoint: ${zapEndpoint}`, { status: response.status });
        if (response.status !== 200) {
            debug(`Received non-200 status from zap endpoint: ${zapEndpoint}`, {
                status: response.status,
                amount: amount,
                nostr: JSON.stringify(event.rawEvent()),
            });
            const text = await response.text();
            throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
        }
        const body = await response.json();

        return body.pr;
    }

    public async generateZapRequest(
        amount: number, // amount to zap in millisatoshis
        comment?: string,
        extraTags?: NDKTag[],
        relays?: string[],
        signer?: NDKSigner
    ): Promise<{ event: NDKEvent; zapEndpoint: string } | null> {
        const zapEndpoint = await this.getZapEndpoint();

        if (!zapEndpoint) {
            throw new Error("No zap endpoint found");
        }

        if (!this.zappedEvent && !this.zappedUser) throw new Error("No zapped event or user found");

        const zapRequest = nip57.makeZapRequest({
            profile: this.zappedUser.pubkey,

            // set the event to null since nostr-tools doesn't support nip-33 zaps
            event: null,
            amount,
            comment: comment || "",
            relays: relays ?? this.relays(),
        });

        // add the event tag if it exists; this supports both 'e' and 'a' tags
        if (this.zappedEvent) {
            const tags = this.zappedEvent.referenceTags();
            const nonPTags = tags.filter((tag) => tag[0] !== "p");
            zapRequest.tags.push(...nonPTags);
        }

        zapRequest.tags.push(["lnurl", zapEndpoint]);

        const event = new NDKEvent(this.ndk, zapRequest as NostrEvent);
        if (extraTags) {
            event.tags = event.tags.concat(extraTags);
        }

        return { event, zapEndpoint };
    }

    /**
     * @returns the relays to use for the zap request
     */
    private relays(): string[] {
        let r: string[] = [];

        if (this.ndk?.pool?.relays) {
            r = this.ndk.pool.urls();
        }

        if (!r.length) {
            r = DEFAULT_RELAYS;
        }

        return r;
    }
}
