import EventEmitter from "eventemitter3";
import { getEventHash, UnsignedEvent } from "nostr-tools";
import NDK, { NDKRelaySet } from "../index.js";
import { NDKSigner } from "../signers/index.js";
import Zap from "../zap/index.js";
import { generateContentTags } from "./content-tagger.js";
import { isParamReplaceable, isReplaceable, NDKKind } from "./kind.js";
import { decrypt, encrypt } from "./nip04.js";
import { encode } from "./nip19.js";

export type NDKEventId = string;
export type NDKTag = string[];

export type NostrEvent = {
    created_at: number;
    content: string;
    tags: NDKTag[];
    kind?: NDKKind | number;
    pubkey: string;
    id?: string;
    sig?: string;
};

type ContentTag = {
    tags: NDKTag[];
    content: string;
};

/**
 * NDKEvent is the basic building block of NDK; most things
 * you do with NDK will revolve around writing or consuming NDKEvents.
 */
export default class NDKEvent extends EventEmitter {
    public ndk?: NDK;
    public created_at?: number;
    public content = "";
    public tags: NDKTag[] = [];
    public kind?: NDKKind | number;
    public id = "";
    public sig?: string;
    public pubkey = "";

    constructor(ndk?: NDK, event?: NostrEvent) {
        super();
        this.ndk = ndk;
        this.created_at = event?.created_at;
        this.content = event?.content || "";
        this.tags = event?.tags || [];
        this.id = event?.id || "";
        this.sig = event?.sig;
        this.pubkey = event?.pubkey || "";
        this.kind = event?.kind;
    }

    /**
     * Returns the event as is.
     */
    public rawEvent(): NostrEvent {
        return {
            created_at: this.created_at,
            content: this.content,
            tags: this.tags,
            kind: this.kind,
            pubkey: this.pubkey,
            id: this.id,
            sig: this.sig
        } as NostrEvent;
    }

    /**
     * Return a NostrEvent object, trying to fill in missing fields
     * when possible, adding tags when necessary.
     */
    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        if (!pubkey && this.pubkey === "") {
            const user = await this.ndk?.signer?.user();
            this.pubkey = user?.hexpubkey() || "";
        }

        if (!this.created_at) this.created_at = Math.floor(Date.now() / 1000);

        const nostrEvent = this.rawEvent();
        const { content, tags } = this.generateTags();
        nostrEvent.content = content || "";
        nostrEvent.tags = tags;

        try {
            this.id = getEventHash(nostrEvent as UnsignedEvent);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        if (this.id) nostrEvent.id = this.id;
        if (this.sig) nostrEvent.sig = this.sig;

        return nostrEvent;
    }

    public isReplaceable = isReplaceable.bind(this);
    public isParamReplaceable = isParamReplaceable.bind(this);
    public encode = encode.bind(this);
    public encrypt = encrypt.bind(this);
    public decrypt = decrypt.bind(this);

    /**
     * Get all tags with the given name
     */
    public getMatchingTags(tagName: string): NDKTag[] {
        return this.tags.filter((tag) => tag[0] === tagName);
    }

    public async toString() {
        return await this.toNostrEvent();
    }

    /**
     * Sign the event if a signer is present.
     *
     * It will generate tags.
     * Repleacable events will have their created_at field set to the current time.
     */
    public async sign(signer?: NDKSigner) {
        signer || this.ndk?.assertSigner();

        await this.generateTags();

        if (this.isReplaceable()) {
            this.created_at = Math.floor(Date.now() / 1000);
        }

        const nostrEvent = await this.toNostrEvent();
        const _signer = signer || this.ndk?.signer;
        this.sig = await _signer!.sign(nostrEvent);
    }

    public async publish(relaySet?: NDKRelaySet): Promise<void> {
        if (!this.sig) await this.sign();

        return this.ndk?.publish(this, relaySet);
    }

    private generateTags(): ContentTag {
        let tags: NDKTag[] = [];

        // don't autogenerate if there currently are tags
        const g = generateContentTags(this.content, this.tags);
        const content = g.content;
        tags = g.tags;

        // if this is a parameterized replaceable event, check if there's a d tag, if not, generate it
        if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
            const dTag = this.getMatchingTags("d")[0];
            // generate a string of 32 random bytes
            if (!dTag) {
                const str = [...Array(16)].map(() => Math.random().toString(36)[2]).join("");
                tags.push(["d", str]);
            }
        }

        return { content: content || "", tags };
    }

    /**
     * @returns the `d` tag of a parameterized replaceable event
     */
    replaceableDTag() {
        if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
            const dTag = this.getMatchingTags("d")[0];
            const dTagId = dTag ? dTag[1] : "";

            return dTagId;
        }

        throw new Error("Event is not a parameterized replaceable event");
    }

    /**
     * @returns the id of the event, or if it's a parameterized event, the id of the event with the d tag
     */
    tagId() {
        // NIP-33
        if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
            const dTagId = this.replaceableDTag();

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
     *
     * @param amount The amount to zap
     * @param comment A comment to add to the zap request
     * @param extraTags Extra tags to add to the zap request
     */
    async zap(amount: number, comment?: string, extraTags?: NDKTag[]): Promise<string | null> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const zap = new Zap({
            ndk: this.ndk,
            zappedEvent: this
        });

        const paymentRequest = await zap.createZapRequest(amount, comment, extraTags);

        // await zap.publish(amount);
        return paymentRequest;
    }
}
