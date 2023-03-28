import { getEventHash, Kind } from "nostr-tools";
import EventEmitter from "eventemitter3";
import NDK from "../";
import Zap from '../zap';

export type EventId = string;
export type Tag = string[];

export type NostrEvent = {
    created_at: number;
    content: string;
    subject?: string;
    tags: string[][];
    kind: Kind;
    pubkey: string;
    id?: string;
    sig?: string;
};

export default class Event extends EventEmitter {
    public ndk?: NDK;
    public created_at?: number;
    public content = '';
    public subject: string | undefined;
    public tags: Tag[] = [];
    public kind: Kind = -1;
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
        this.kind = event?.kind || -1;
        this.id = event?.id || '';
        this.sig = event?.sig;
        this.pubkey = event?.pubkey || '';
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        if (!pubkey) pubkey = await this.ndk?.signer?.user?.hexpubkey();

        const nostrEvent: NostrEvent = {
            created_at: this.created_at || Math.floor(Date.now() / 1000),
            content: this.content,
            tags: this.tags,
            kind: this.kind || 0,
            pubkey: pubkey || '',
        };

        this.generateTags();

        if (this.subject) nostrEvent.subject = this.subject;

        try {
            nostrEvent.id = getEventHash(nostrEvent);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        if (this.sig) nostrEvent.sig = this.sig;

        return nostrEvent;
    }

    /**
     * Get all tags with the given name
     */
    getMatchingTags(tagName: string): Tag[] {
        return this.tags.filter((tag) => tag[0] === tagName);
    }

    async toString() {
        return await this.toNostrEvent();
    }

    async sign() {
        this.ndk?.assertSigner();

        await this.generateTags();

        const nostrEvent = await this.toNostrEvent();
        this.sig = await this.ndk?.signer?.sign(nostrEvent);
    }

    async generateTags() {
        // if this is a paramterized repleacable event, check there's a d tag, if not, generate it
        if (this.kind >= 30000 && this.kind <= 40000) {
            const dTag = this.getMatchingTags('d')[0];
            if (!dTag) {
                this.tags.push(['d', ""]);
            }
        }

        // don't autogenerate if there currently are tags
        if (this.tags.length > 0) return;

        // split content in words
    }

    async zap(amount: number, comment?: string): Promise<string|null> {
        this.ndk?.assertSigner();

        const zap = new Zap({
            ndk: this.ndk,
            zappedEvent: this
        });

        const paymentRequest = await zap.createZapRequest(amount, comment);

        // await zap.publish(amount);
        return paymentRequest;
    }
}
