import NDK from "../";
import EventEmitter from 'eventemitter3';
import Event from "../events";
import type {NostrEvent} from "../events";
import User from "../user";
import axios from "axios";
import {nip57} from "nostr-tools";

interface ZapConstructorParams {
    ndk?: NDK;
    zappedEvent?: Event;
    zappedUser?: User;
}

export default class Zap extends EventEmitter {
    public ndk?: NDK;
    public zappedEvent?: Event;
    public zappedUser: User;

    public constructor(args: ZapConstructorParams) {
        super();
        this.ndk = args.ndk;
        this.zappedEvent = args.zappedEvent;
        this.zappedUser = args.zappedUser!;

        if (!this.zappedUser && this.zappedEvent) {
            this.zappedUser = this.ndk?.getUser({hexpubkey: this.zappedEvent.pubkey})!;
        }
    }

    public async getZapEndpoint(): Promise<string|undefined> {
        let lud16: string | undefined;
        let zapEndpoint: string | undefined;

        // check if event has zap tag
        // otherwise use the user's zap endpoint
        // if no zap endpoint, throw error
        if (this.zappedEvent) {
            const zapTag = (await this.zappedEvent.getMatchingTags('zap'))[0];

            if (zapTag) {
                switch (zapTag[2]) {
                    case 'lud16': lud16 = zapTag[1]; break;
                    default:
                        throw new Error(`Unknown zap tag ${zapTag}`);
                }
            }
        }

        if (this.zappedUser) {
            // check if user has a profile, otherwise request it
            if (!this.zappedUser.profile) {
                await this.zappedUser.fetchProfile();
            }

            lud16 = (this.zappedUser.profile || {}).lud16;

            console.log('this.zappedUser.profile', this.zappedUser.profile);
        }

        if (lud16) {
            let [name, domain] = lud16.split('@')
            zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`

            const response = await axios.get(zapEndpoint);
            console.log('response', response);

            if (response?.data?.allowNostr && response?.data?.nostrPubkey) {
                zapEndpoint = response?.data?.callback;
            }
        }

        return zapEndpoint;
    }

    public async createZapRequest(amount: number, comment?: string): Promise<string|null> {
        const zapEndpoint = await this.getZapEndpoint()

        if (!zapEndpoint) {
            throw new Error('No zap endpoint found');
        }

        const zapRequest = nip57.makeZapRequest({
            profile: this.zappedUser.hexpubkey(),
            event: this.zappedEvent?.id!,
            amount,
            comment: comment!,
            relays: ['wss://nos.lol'],
        })

        // sign
        const zapRequestEvent = new Event(this.ndk, zapRequest as NostrEvent);
        await zapRequestEvent.sign();

        console.log('zapRequestEvent', await zapRequestEvent.toNostrEvent());


        // get with axios on zapEndpoint adding to querystring amount=amount and nostr with a URI encoded zapRequest
        const response = await axios.get(zapEndpoint, {
            params: {
                amount,
                nostr: JSON.stringify(await zapRequestEvent.toNostrEvent()),
            }
        });

        console.log('response', response);

        return response.data?.pr;
    }
}
