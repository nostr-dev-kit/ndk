import EventEmitter from "eventemitter3";
import { getEventHash, UnsignedEvent } from "nostr-tools";
import NDK, { NDKFilter, NDKRelay, NDKRelaySet, NDKUser } from "../index.js";
import { NDKSigner } from "../signers/index.js";
import Zap from "../zap/index.js";
import { generateContentTags } from "./content-tagger.js";
import { isParamReplaceable, isReplaceable } from "./kind.js";
import { NDKKind } from "./kinds/index.js";
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

    /**
     * The relay that this event was first received from.
     */
    public relay: NDKRelay | undefined;

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

    set author(user: NDKUser) {
        this.pubkey = user.hexpubkey();
    }

    /**
     * Returns an NDKUser for the author of the event.
     */
    get author(): NDKUser {
        const user = new NDKUser({ hexpubkey: this.pubkey });
        user.ndk = this.ndk;
        return user;
    }

    /**
     * Tag a user with an optional marker.
     * @param user The user to tag.
     * @param marker The marker to use in the tag.
     */
    public tag(user: NDKUser, marker?: string): void;

    /**
     * Tag a user with an optional marker.
     * @param event The event to tag.
     * @param marker The marker to use in the tag.
     * @example
     * ```typescript
     * reply.tag(opEvent, "reply");
     * // reply.tags => [["e", <id>, <relay>, "reply"]]
     * ```
     */
    public tag(event: NDKEvent, marker?: string): void;
    public tag(userOrEvent: NDKUser | NDKEvent, marker?: string): void {
        const tag = userOrEvent.tagReference();
        if (marker) tag.push(marker);
        this.tags.push(tag);

        if (userOrEvent instanceof NDKEvent) {
            const tagEventAuthor = userOrEvent.author;

            // If event author is not the same as the user signing this event, tag the author
            if (tagEventAuthor && this.pubkey !== tagEventAuthor.hexpubkey()) {
                this.tag(tagEventAuthor);
            }

            // tag p-tags in the event if they are not the same as the user signing this event
            for (const pTag of userOrEvent.getMatchingTags("p")) {
                if (pTag[1] === this.pubkey) continue;
                if (this.tags.find((t) => t[0] === 'p' && t[1] === pTag[1])) continue;

                this.tags.push(["p", pTag[1]]);
            }
        }
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

    /**
     * Get the first tag with the given name
     * @param tagName Tag name to search for
     * @returns The value of the first tag with the given name, or undefined if no such tag exists
     */
    public tagValue(tagName: string): string | undefined {
        const tags = this.getMatchingTags(tagName);
        if (tags.length === 0) return undefined;
        return tags[0][1];
    }

    /**
     * Remove all tags with the given name
     * @param tagName Tag name to search for
     */
    public removeTag(tagName: string): void {
        this.tags = this.tags.filter((tag) => tag[0] !== tagName);
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
        if (this.isParamReplaceable()) {
            return ["a", this.tagId()];
        }

        return ["e", this.tagId()];
    }

    /**
     * Provides the filter that will return matching events for this event.
     */
    filter(): NDKFilter {
        if (this.isParamReplaceable()) {
            return { "#a": [this.tagId()] };
        } else {
            return { "#e": [this.tagId()] };
        }
    }

    /**
     * Create a zap request for an existing event
     *
     * @param amount The amount to zap in millisatoshis
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

    /**
     * Generates a deletion event of the current event
     *
     * @param reason The reason for the deletion
     * @returns The deletion event
     */
    async delete(reason?: string): Promise<NDKEvent> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const e = new NDKEvent(this.ndk, {
            kind: NDKKind.EventDeletion,
            content: reason || "",
        } as NostrEvent);
        e.tag(this);
        await e.publish();

        return e;
    }

    /**
     * NIP-18
     * Repost event.
     */
    async repost(): Promise<NDKEvent> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const e = new NDKEvent(this.ndk, {
            kind: NDKKind.Repost,
            content: "",
        } as NostrEvent);
        e.tag(this);
        await e.publish();

        return e;
    }
}
