import { bech32 } from "@scure/base";
import EventEmitter from "eventemitter3";
import { nip57 } from "nostr-tools";
import type { NostrEvent } from "../events/index.js";
import NDKEvent, { NDKTag } from "../events/index.js";
import NDK from "../index.js";
import User from "../user/index.js";

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
    zappedUser?: User;
}

type ZapConstructorParamsRequired = Required<
    Pick<ZapConstructorParams, "zappedEvent">
> &
    Pick<ZapConstructorParams, "zappedUser"> &
    ZapConstructorParams;

export default class Zap extends EventEmitter {
    public ndk?: NDK;
    public zappedEvent?: NDKEvent;
    public zappedUser: User;

    public constructor(args: ZapConstructorParamsRequired) {
        super();
        this.ndk = args.ndk;
        this.zappedEvent = args.zappedEvent;

        this.zappedUser =
            args.zappedUser ||
            this.ndk.getUser({ hexpubkey: this.zappedEvent.pubkey });
    }

    public async getZapEndpoint(): Promise<string | undefined> {
        let lud06: string | undefined;
        let lud16: string | undefined;
        let zapEndpoint: string | undefined;
        let zapEndpointCallback: string | undefined;

        if (this.zappedEvent) {
            const zapTag = (await this.zappedEvent.getMatchingTags("zap"))[0];

            if (zapTag) {
                switch (zapTag[2]) {
                    case "lud06":
                        lud06 = zapTag[1];
                        break;
                    case "lud16":
                        lud16 = zapTag[1];
                        break;
                    default:
                        throw new Error(`Unknown zap tag ${zapTag}`);
                }
            }
        }

        if (this.zappedUser && !lud06 && !lud16) {
            // check if user has a profile, otherwise request it
            if (!this.zappedUser.profile) {
                await this.zappedUser.fetchProfile();
            }

            lud06 = (this.zappedUser.profile || {}).lud06;
            lud16 = (this.zappedUser.profile || {}).lud16;
        }

        if (lud16) {
            const [name, domain] = lud16.split("@");
            zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
        } else if (lud06) {
            const { words } = bech32.decode(lud06, 1000);
            const data = bech32.fromWords(words);
            const utf8Decoder = new TextDecoder("utf-8");
            zapEndpoint = utf8Decoder.decode(data);
        }

        if (!zapEndpoint) {
            throw new Error("No zap endpoint found");
        }

        const response = await fetch(zapEndpoint);
        const body = await response.json();

        if (body?.allowsNostr && (body?.nostrPubkey || body?.nostrPubKey)) {
            zapEndpointCallback = body.callback;
        }

        return zapEndpointCallback;
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
        relays?: string[]
    ): Promise<string | null> {
        const zapEndpoint = await this.getZapEndpoint();

        if (!zapEndpoint) {
            throw new Error("No zap endpoint found");
        }

        if (!this.zappedEvent) throw new Error("No zapped event found");

        const zapRequest = nip57.makeZapRequest({
            profile: this.zappedUser.hexpubkey(),

            // set the event to null since nostr-tools doesn't support nip-33 zaps
            event: null,
            amount,
            comment: comment || "",
            relays: relays ?? this.relays(),
        });

        // add the event tag if it exists; this supports both 'e' and 'a' tags
        if (this.zappedEvent) {
            const tag = this.zappedEvent.tagReference();
            if (tag) {
                zapRequest.tags.push(tag);
            }
        }

        zapRequest.tags.push(["lnurl", zapEndpoint]);

        const zapRequestEvent = new NDKEvent(
            this.ndk,
            zapRequest as NostrEvent
        );
        if (extraTags) {
            zapRequestEvent.tags = zapRequestEvent.tags.concat(extraTags);
        }

        await zapRequestEvent.sign();
        const zapRequestNostrEvent = await zapRequestEvent.toNostrEvent();

        const response = await fetch(
            `${zapEndpoint}?` +
                new URLSearchParams({
                    amount: amount.toString(),
                    nostr: JSON.stringify(zapRequestNostrEvent),
                })
        );
        const body = await response.json();

        return body.pr;
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
