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
import { repost } from "./repost.js";

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

export type ContentTag = {
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
            sig: this.sig,
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
                if (this.tags.find((t) => t[0] === "p" && t[1] === pTag[1]))
                    continue;

                this.tags.push(["p", pTag[1]]);
            }
        }
    }

    /**
     * Return a NostrEvent object, trying to fill in missing fields
     * when possible, adding tags when necessary.
     * @param pubkey {string} The pubkey of the user who the event belongs to.
     * @returns {Promise<NostrEvent>} A promise that resolves to a NostrEvent.
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

    /**
     * Encodes a bech32 id.
     *
     * @returns {string} - Encoded naddr, note or nevent.
     */
    public encode = encode.bind(this);
    public encrypt = encrypt.bind(this);
    public decrypt = decrypt.bind(this);

    /**
     * Get all tags with the given name
     * @param tagName {string} The name of the tag to search for
     * @returns {NDKTag[]} An array of the matching tags
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
     * Remove all tags with the given name (e.g. "d", "a", "p")
     * @param tagName Tag name to search for and remove
     * @returns {void}
     */
    public removeTag(tagName: string): void {
        this.tags = this.tags.filter((tag) => tag[0] !== tagName);
    }

    /**
     * Sign the event if a signer is present.
     *
     * It will generate tags.
     * Repleacable events will have their created_at field set to the current time.
     * @param signer {NDKSigner} The NDKSigner to use to sign the event
     * @returns {Promise<string>} A Promise that resolves to the signature of the signed event.
     */
    public async sign(signer?: NDKSigner): Promise<string> {
        if (!signer) {
            this.ndk?.assertSigner();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            signer = this.ndk!.signer!;
        }

        await this.generateTags();

        if (this.isReplaceable()) {
            this.created_at = Math.floor(Date.now() / 1000);
        }

        const nostrEvent = await this.toNostrEvent();

        this.sig = await signer.sign(nostrEvent);

        return this.sig;
    }

    /**
     * Attempt to sign and then publish an NDKEvent to a given relaySet.
     * If no relaySet is provided, the relaySet will be calculated by NDK.
     * @param relaySet {NDKRelaySet} The relaySet to publish the even to.
     * @returns A promise that resolves to the relays the event was published to.
     */
    public async publish(
        relaySet?: NDKRelaySet,
        timeoutMs?: number
    ): Promise<Set<NDKRelay>> {
        if (!this.sig) await this.sign();
        if (!this.ndk)
            throw new Error(
                "NDKEvent must be associated with an NDK instance to publish"
            );

        return this.ndk.publish(this, relaySet, timeoutMs);
    }

    /**
     * Generates tags for users, notes, and other events tagged in content.
     * Will also generate random "d" tag for parameterized replaceable events where needed.
     * @returns {ContentTag} The tags and content of the event.
     */
    protected generateTags(): ContentTag {
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
                const str = [...Array(16)]
                    .map(() => Math.random().toString(36)[2])
                    .join("");
                tags.push(["d", str]);
            }
        }

        return { content: content || "", tags };
    }

    /**
     * Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
     * a parameterized replaceable event.
     * @returns {string} the "d" tag of the event.
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
     * Provides a deduplication key for the event.
     *
     * For kinds 0, 3, 10k-20k this will be the event <kind>:<pubkey>
     * For kinds 30k-40k this will be the event <kind>:<pubkey>:<d-tag>
     * For all other kinds this will be the event id
     */
    deduplicationKey(): string {
        if (this.kind === 0 || this.kind === 3) {
            return `${this.kind}:${this.pubkey}`;
        } else {
            return this.tagId();
        }
    }

    /**
     * Returns the id of the event or, if it's a parameterized event, the generated id of the event using "d" tag, pubkey, and kind.
     * @returns {string} The id
     */
    tagId(): string {
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
     * @returns {NDKTag} The NDKTag object referencing this event
     */
    tagReference(): NDKTag {
        // NIP-33
        if (this.isParamReplaceable()) {
            return ["a", this.tagId()];
        }

        return ["e", this.tagId()];
    }

    /**
     * Provides the filter that will return matching events for this event.
     *
     * @example
     *    event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
     *    event.filter(); // { "#a": ["30000:pubkey:d-code"] }
     * @example
     *    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
     *    event.filter(); // { "#e": ["eventid"] }
     *
     * @returns The filter that will return matching events for this event
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
    async zap(
        amount: number,
        comment?: string,
        extraTags?: NDKTag[]
    ): Promise<string | null> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const zap = new Zap({
            ndk: this.ndk,
            zappedEvent: this,
        });

        const paymentRequest = await zap.createZapRequest(
            amount,
            comment,
            extraTags
        );

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
     * NIP-18 reposting event.
     *
     * @param publish Whether to publish the reposted event automatically
     * @param signer The signer to use for signing the reposted event
     * @returns The reposted event
     *
     * @function
     */
    public repost = repost.bind(this);
}
