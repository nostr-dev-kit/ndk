import {getEventHash, Kind} from 'nostr-tools';
import EventEmitter from 'eventemitter3';
import NDK from '../';

export type EventId = string;

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
    public tags: string[][] = [];
    public kind: Kind = -1;
    public id = '';
    public sig?: string;
    public pubkey = '';

    constructor(ndk?: NDK) {
        super();
        this.ndk = ndk;
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

        if (this.subject) nostrEvent.subject = this.subject;

        try {
            nostrEvent.id = getEventHash(nostrEvent);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        if (this.sig) nostrEvent.sig = this.sig;

        return nostrEvent;
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
        // don't autogenerate if there currently are tags
        if (this.tags.length > 0) return;

        // split content in words
    }
}
