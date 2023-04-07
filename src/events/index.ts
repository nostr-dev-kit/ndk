import { getEventHash, UnsignedEvent } from "nostr-tools";
import EventEmitter from "eventemitter3";
import NDK from "../index.js";
import Zap from '../zap/index.js';
import { generateContentTags } from "./content-tagger.js";
import { NDKKind } from "./kind.js";
import { isParamReplaceable, isReplaceable } from "./kind.js";
import { encode } from "./nip19.js";

export type NDKEventId = string;
export type NDKTag = string[];

export type NostrEvent = {
    created_at: number;
    content: string;
    subject?: string;
    tags: NDKTag[];
    kind?: NDKKind | number;
    pubkey: string;
    id?: string;
    sig?: string;
};

export default class NDKEvent extends EventEmitter {
    public ndk?: NDK;
    public created_at?: number;
    public content = '';
    public subject: string | undefined;
    public tags: NDKTag[] = [];
    public kind?: NDKKind | number;
    public id = "";
    public sig?: string;
    public pubkey = '';

    constructor(ndk?: NDK, event?: NostrEvent) {
        super();
        this.ndk = ndk;
        this.created_at = event?.created_at;
        this.content = event?.content || '';
        this.subject = event?.subject;
        this.tags = event?.tags || [];
        this.id = event?.id || '';
        this.sig = event?.sig;
        this.pubkey = event?.pubkey || '';
        if (event?.kind) this.kind = event?.kind;
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        if (!pubkey) {
            const user = await this.ndk?.signer?.user();
            pubkey = user?.hexpubkey();
        }

        const nostrEvent: NostrEvent = {
            created_at: this.created_at || Math.floor(Date.now() / 1000),
            content: this.content,
            tags: this.tags,
            kind: this.kind || 0,
            pubkey: pubkey || this.pubkey,
            id: this.id,
        };

        this.generateTags();

        if (this.subject) nostrEvent.subject = this.subject;

        try {
            nostrEvent.id = getEventHash(nostrEvent as UnsignedEvent);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        if (this.sig) nostrEvent.sig = this.sig;

        return nostrEvent;
    }

    public isReplaceable = isReplaceable.bind(this);
    public isParamReplaceable = isParamReplaceable.bind(this);
    public encode = encode.bind(this);

    /**
     * Get all tags with the given name
     */
    public getMatchingTags(tagName: string): NDKTag[] {
        return this.tags.filter((tag) => tag[0] === tagName);
    }

    public async toString() {
        return await this.toNostrEvent();
    }

    public async sign() {
        this.ndk?.assertSigner();

        await this.generateTags();

        const nostrEvent = await this.toNostrEvent();
        this.sig = await this.ndk?.signer?.sign(nostrEvent);
    }

    public async publish() : Promise<void> {
        if (!this.sig) await this.sign();

        return this.ndk?.publish(this);
    }

    private async generateTags() {
        // don't autogenerate if there currently are tags
        if (this.tags.length > 0) {
            const { content, tags } = generateContentTags(this.content, this.tags);
            this.content = content;
            this.tags = tags;
        }

        // if this is a paramterized repleacable event, check if there's a d tag, if not, generate it
        if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
            const dTag = this.getMatchingTags('d')[0];
            // generate a string of 32 random bytes
            if (!dTag) {
                const str = [...Array(16)].map(() => Math.random().toString(36)[2]).join('');
                this.tags.push(['d', str]);
            }
        }
    }

    /**
     * @returns the id of the event, or if it's a parameterized event, the id of the event with the d tag
     */
    tagId() {
        // NIP-33
        if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
            const dTag = this.getMatchingTags('d')[0];
            const dTagId = dTag ? dTag[1] : '';

            return `${this.kind}:${this.pubkey}:${dTagId}`;
        }

        return this.id;
    }

    /**
     * Get the tag that can be used to reference this event from another event
     * @example
     *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
     *     event.tagReference(); // ["a", "30000:pubkey:d-code"]
     *
     *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
     *     event.tagReference(); // ["e", "eventid"]
     */
    tagReference() {
        // NIP-33
        if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
            return ["a", this.tagId()];
        }

        return ["e", this.tagId()];
    }

    /**
     * Create a zap request for an existing event
     */
    async zap(amount: number, comment?: string): Promise<string|null> {
        if (!this.ndk) throw new Error('No NDK instance found');

        this.ndk.assertSigner();

        const zap = new Zap({
            ndk: this.ndk,
            zappedEvent: this,
        });

        const paymentRequest = await zap.createZapRequest(amount, comment);

        // await zap.publish(amount);
        return paymentRequest;
    }
}
