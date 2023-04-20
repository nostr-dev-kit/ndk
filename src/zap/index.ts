import NDK from "../index.js";
import EventEmitter from 'eventemitter3';
import NDKEvent, { NDKTag } from "../events/index.js";
import type {NostrEvent} from "../events/index.js";
import User from "../user/index.js";
import {nip57} from "nostr-tools";
import {bech32} from '@scure/base';
interface ZapConstructorParams {
    ndk: NDK;
    zappedEvent?: NDKEvent;
    zappedUser?: User;
}

type ZapConstructorParamsRequired = Required<Pick<ZapConstructorParams, 'zappedEvent'>> & Pick<ZapConstructorParams, 'zappedUser'> & ZapConstructorParams;

export default class Zap extends EventEmitter {
    public ndk?: NDK;
    public zappedEvent?: NDKEvent;
    public zappedUser: User;

    public constructor(args: ZapConstructorParamsRequired) {
        super();
        this.ndk = args.ndk;
        this.zappedEvent = args.zappedEvent;

        this.zappedUser = args.zappedUser || this.ndk.getUser({hexpubkey: this.zappedEvent.pubkey});
    }

    public async getZapEndpoint(): Promise<string|undefined> {
        let lud06: string | undefined;
        let lud16: string | undefined;
        let zapEndpoint: string | undefined;
        let zapEndpointCallback: string | undefined;

        if (this.zappedEvent) {
            const zapTag = (await this.zappedEvent.getMatchingTags('zap'))[0];

            if (zapTag) {
                switch (zapTag[2]) {
                    case "lud06": lud06 = zapTag[1]; break;
                    case 'lud16': lud16 = zapTag[1]; break;
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
            const [name, domain] = lud16.split('@');
            zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
        } else if (lud06) {
            const {words} = bech32.decode(lud06, 1000);
            const data = bech32.fromWords(words);
            const utf8Decoder = new TextDecoder('utf-8');
            zapEndpoint = utf8Decoder.decode(data);
        }

        if (!zapEndpoint) {
            throw new Error('No zap endpoint found');
        }

        const response = await fetch(zapEndpoint);
        const body = await response.json();

        if (body?.allowsNostr && (body?.nostrPubkey || body?.nostrPubKey)) {
            zapEndpointCallback = body.callback;
        }

        return zapEndpointCallback;
    }

    public async createZapRequest(amount: number, comment?: string, extraTags?: NDKTag[]): Promise<string|null> {
        const zapEndpoint = await this.getZapEndpoint();

        if (!zapEndpoint) {
            throw new Error('No zap endpoint found');
        }

        if (!this.zappedEvent) throw new Error('No zapped event found');

        const zapRequest = nip57.makeZapRequest({
            profile: this.zappedUser.hexpubkey(),

            // set the event to null since nostr-tools doesn't support nip-33 zaps
            event: null,
            amount,
            comment: comment || '',
            relays: ['wss://nos.lol', 'wss://relay.nostr.band', 'wss://relay.f7z.io', 'wss://relay.damus.io', 'wss://nostr.mom', 'wss://no.str.cr'], // TODO: fix this
        });

        // add the event tag if it exists; this supports both 'e' and 'a' tags
        if (this.zappedEvent) {
            const tag = this.zappedEvent.tagReference();
            if (tag) {
                zapRequest.tags.push(tag);
            }
        }

        const zapRequestEvent = new NDKEvent(this.ndk, zapRequest as NostrEvent);
        if (extraTags) {
            zapRequestEvent.tags = zapRequestEvent.tags.concat(extraTags);
        }

        await zapRequestEvent.sign();
        const zapRequestNostrEvent = await zapRequestEvent.toNostrEvent();

        const response = await fetch(`${zapEndpoint}?` + new URLSearchParams({
                amount: amount.toString(),
                nostr: encodeURIComponent(JSON.stringify(zapRequestNostrEvent)),
            })
        );
        const body = await response.json();

        return body.pr;
    }
}
