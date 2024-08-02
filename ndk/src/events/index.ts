import { EventEmitter } from "tseep";

import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import { calculateRelaySetFromEvent } from "../relay/sets/calculate.js";
import type { NDKRelaySet } from "../relay/sets/index.js";
import type { NDKSigner } from "../signers/index.js";
import type { NDKFilter } from "../subscription/index.js";
import { type NDKUser } from "../user/index.js";
import { type ContentTag, generateContentTags, mergeTags } from "./content-tagger.js";
import { isEphemeral, isParamReplaceable, isReplaceable } from "./kind.js";
import { NDKKind } from "./kinds/index.js";
import { decrypt, encrypt } from "./nip04.js";
import { encode } from "./nip19.js";
import { repost } from "./repost.js";
import { fetchReplyEvent, fetchRootEvent, fetchTaggedEvent } from "./fetch-tagged-event.js";
import { type NDKEventSerialized, deserialize, serialize } from "./serializer.js";
import { validate, verifySignature, getEventHash } from "./validation.js";
import { matchFilter } from "nostr-tools";

const skipClientTagOnKinds = [NDKKind.Contacts];

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

/**
 * NDKEvent is the basic building block of NDK; most things
 * you do with NDK will revolve around writing or consuming NDKEvents.
 */
export class NDKEvent extends EventEmitter {
    public ndk?: NDK;
    public created_at?: number;
    public content = "";
    public tags: NDKTag[] = [];
    public kind?: NDKKind | number;
    public id = "";
    public sig?: string;
    public pubkey = "";
    public signatureVerified?: boolean;

    private _author: NDKUser | undefined = undefined;

    /**
     * The relay that this event was first received from.
     */
    public relay: NDKRelay | undefined;

    /**
     * The relays that this event was received from and/or successfully published to.
     */
    get onRelays(): NDKRelay[] {
        let res: NDKRelay[] = [];
        if (!this.ndk) {
            if (this.relay) res.push(this.relay);
        } else {
            res = this.ndk.subManager.seenEvents.get(this.id) || [];
        }
        return res;
    }

    /**
     * The status of the publish operation.
     */
    public publishStatus?: "pending" | "success" | "error" = "success";
    public publishError?: Error;

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super();
        this.ndk = ndk;
        this.created_at = event?.created_at;
        this.content = event?.content || "";
        this.tags = event?.tags || [];
        this.id = event?.id || "";
        this.sig = event?.sig;
        this.pubkey = event?.pubkey || "";
        this.kind = event?.kind;

        if (event instanceof NDKEvent) {
            if (this.relay) {
                this.relay = event.relay;
                this.ndk?.subManager.seenEvent(event.id, this.relay!);
            }
            this.publishStatus = event.publishStatus;
            this.publishError = event.publishError;
        }
    }

    /**
     * Deserialize an NDKEvent from a serialized payload.
     * @param ndk
     * @param event
     * @returns
     */
    static deserialize(ndk: NDK | undefined, event: NDKEventSerialized): NDKEvent {
        return new NDKEvent(ndk, deserialize(event));
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
        this.pubkey = user.pubkey;
        this._author = user;
        this._author.ndk ??= this.ndk;
    }

    /**
     * Returns an NDKUser for the author of the event.
     */
    get author(): NDKUser {
        if (this._author) return this._author;

        if (!this.ndk) throw new Error("No NDK instance found");

        const user = this.ndk.getUser({ pubkey: this.pubkey });
        this._author = user;
        return user;
    }

    /**
     * Tag a user with an optional marker.
     * @param target What is to be tagged. Can be an NDKUser, NDKEvent, or an NDKTag.
     * @param marker The marker to use in the tag.
     * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event.
     * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag.
     * @example
     * ```typescript
     * reply.tag(opEvent, "reply");
     * // reply.tags => [["e", <id>, <relay>, "reply"]]
     * ```
     */
    public tag(
        target: NDKTag | NDKUser | NDKEvent,
        marker?: string,
        skipAuthorTag?: boolean,
        forceTag?: string
    ): void {
        let tags: NDKTag[] = [];
        const isNDKUser = (target as NDKUser).fetchProfile !== undefined;

        if (isNDKUser) {
            forceTag ??= "p";
            const tag = [forceTag, (target as NDKUser).pubkey];
            if (marker) tag.push(...["", marker]);
            tags.push(tag);
        } else if (target instanceof NDKEvent) {
            const event = target as NDKEvent;
            skipAuthorTag ??= event?.pubkey === this.pubkey;
            tags = event.referenceTags(marker, skipAuthorTag, forceTag);

            // tag p-tags in the event if they are not the same as the user signing this event
            for (const pTag of event.getMatchingTags("p")) {
                if (pTag[1] === this.pubkey) continue;
                if (this.tags.find((t) => t[0] === "p" && t[1] === pTag[1])) continue;

                this.tags.push(["p", pTag[1]]);
            }
        } else if (Array.isArray(target)) {
            tags = [target as NDKTag];
        } else {
            throw new Error("Invalid argument", target as any);
        }

        this.tags = mergeTags(this.tags, tags);
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
            this.pubkey = user?.pubkey || "";
        }

        if (!this.created_at) {
            this.created_at = Math.floor(Date.now() / 1000);
        }

        const { content, tags } = await this.generateTags();
        this.content = content || "";
        this.tags = tags;

        try {
            this.id = this.getEventHash();
            // eslint-disable-next-line no-empty
        } catch (e) {}

        // if (this.id) nostrEvent.id = this.id;
        // if (this.sig) nostrEvent.sig = this.sig;

        return this.rawEvent();
    }

    public serialize = serialize.bind(this);
    public getEventHash = getEventHash.bind(this);
    public validate = validate.bind(this);
    public verifySignature = verifySignature.bind(this);
    public isReplaceable = isReplaceable.bind(this);
    public isEphemeral = isEphemeral.bind(this);
    public isParamReplaceable = isParamReplaceable.bind(this);

    /**
     * Encodes a bech32 id.
     *
     * @param relays {string[]} The relays to encode in the id
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
    public getMatchingTags(tagName: string, marker?: string): NDKTag[] {
        const t = this.tags.filter((tag) => tag[0] === tagName);

        if (marker === undefined) return t;

        return t.filter((tag) => tag[3] === marker);
    }

    /**
     * Check if the event has a tag with the given name
     * @param tagName
     * @param marker
     * @returns
     */
    public hasTag(tagName: string, marker?: string): boolean {
        return this.tags.some((tag) => tag[0] === tagName && (!marker || tag[3] === marker));
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
     * Gets the NIP-31 "alt" tag of the event.
     */
    get alt(): string | undefined {
        return this.tagValue("alt");
    }

    /**
     * Sets the NIP-31 "alt" tag of the event. Use this to set an alt tag so
     * clients that don't handle a particular event kind can display something
     * useful for users.
     */
    set alt(alt: string | undefined) {
        this.removeTag("alt");
        if (alt) this.tags.push(["alt", alt]);
    }

    /**
     * Gets the NIP-33 "d" tag of the event.
     */
    get dTag(): string | undefined {
        return this.tagValue("d");
    }

    /**
     * Sets the NIP-33 "d" tag of the event.
     */
    set dTag(value: string | undefined) {
        this.removeTag("d");
        if (value) this.tags.push(["d", value]);
    }

    /**
     * Remove all tags with the given name (e.g. "d", "a", "p")
     * @param tagName Tag name(s) to search for and remove
     * @returns {void}
     */
    public removeTag(tagName: string | string[]): void {
        const tagNames = Array.isArray(tagName) ? tagName : [tagName];
        this.tags = this.tags.filter((tag) => !tagNames.includes(tag[0]));
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
        } else {
            this.author = await signer.user();
        }

        const nostrEvent = await this.toNostrEvent();
        this.sig = await signer.sign(nostrEvent);

        return this.sig;
    }

    /**
     *
     * @param relaySet
     * @param timeoutMs
     * @param requiredRelayCount
     * @returns
     */
    public async publishReplaceable(
        relaySet?: NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number
    ) {
        this.id = "";
        this.created_at = Math.floor(Date.now() / 1000);
        this.sig = "";
        return this.publish(relaySet, timeoutMs, requiredRelayCount);
    }

    /**
     * Attempt to sign and then publish an NDKEvent to a given relaySet.
     * If no relaySet is provided, the relaySet will be calculated by NDK.
     * @param relaySet {NDKRelaySet} The relaySet to publish the even to.
     * @param timeoutM {number} The timeout for the publish operation in milliseconds.
     * @param requiredRelayCount The number of relays that must receive the event for the publish to be considered successful.
     * @returns A promise that resolves to the relays the event was published to.
     */
    public async publish(
        relaySet?: NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number
    ): Promise<Set<NDKRelay>> {
        if (!this.sig) await this.sign();
        if (!this.ndk)
            throw new Error("NDKEvent must be associated with an NDK instance to publish");

        if (!relaySet) {
            // If we have a devWriteRelaySet, use it to publish all events
            relaySet =
                this.ndk.devWriteRelaySet || (await calculateRelaySetFromEvent(this.ndk, this));
        }

        // If the published event is a delete event, notify the cache if there is one
        if (this.kind === NDKKind.EventDeletion && this.ndk.cacheAdapter?.deleteEvent) {
            this.ndk.cacheAdapter.deleteEvent(this);
        }

        const rawEvent = this.rawEvent();

        // add to cache for optimistic updates
        if (this.ndk.cacheAdapter?.addUnpublishedEvent) {
            try {
                this.ndk.cacheAdapter.addUnpublishedEvent(this, relaySet.relayUrls);
            } catch (e) {
                console.error("Error adding unpublished event to cache", e);
            }
        }

        // send to active subscriptions that want this event
        this.ndk.subManager.subscriptions.forEach((sub) => {
            if (sub.filters.some((filter) => matchFilter(filter, rawEvent as any))) {
                sub.eventReceived(this, undefined, false, true);
            }
        });

        const relays = await relaySet.publish(this, timeoutMs, requiredRelayCount);
        relays.forEach((relay) => this.ndk?.subManager.seenEvent(this.id, relay));

        return relays;
    }

    /**
     * Generates tags for users, notes, and other events tagged in content.
     * Will also generate random "d" tag for parameterized replaceable events where needed.
     * @returns {ContentTag} The tags and content of the event.
     */
    async generateTags(): Promise<ContentTag> {
        let tags: NDKTag[] = [];

        // don't autogenerate if there currently are tags
        const g = await generateContentTags(this.content, this.tags);
        const content = g.content;
        tags = g.tags;

        // if this is a parameterized replaceable event, check if there's a d tag, if not, generate it
        if (this.kind && this.isParamReplaceable()) {
            const dTag = this.getMatchingTags("d")[0];
            // generate a string of 16 random bytes
            if (!dTag) {
                const title = this.tagValue("title");
                const randLength = title ? 6 : 16;
                let str = [...Array(randLength)].map(() => Math.random().toString(36)[2]).join("");

                if (title && title.length > 0) {
                    str = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") + "-" + str;
                }

                tags.push(["d", str]);
            }
        }

        if (
            (this.ndk?.clientName || this.ndk?.clientNip89) &&
            skipClientTagOnKinds.includes(this.kind!)
        ) {
            if (!this.tags.some((tag) => tag[0] === "client")) {
                const clientTag: NDKTag = ["client", this.ndk.clientName ?? ""];
                if (this.ndk.clientNip89) clientTag.push(this.ndk.clientNip89);
                tags.push(clientTag);
            }
        }

        return { content: content || "", tags };
    }

    public muted(): string | null {
        const authorMutedEntry = this.ndk?.mutedIds.get(this.pubkey);
        if (authorMutedEntry && authorMutedEntry === "p") return "author";

        const eventTagReference = this.tagReference();
        const eventMutedEntry = this.ndk?.mutedIds.get(eventTagReference[1]);
        if (eventMutedEntry && eventMutedEntry === eventTagReference[0]) return "event";

        return null;
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
        if (
            this.kind === 0 ||
            this.kind === 3 ||
            (this.kind && this.kind >= 10000 && this.kind < 20000)
        ) {
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
        if (this.isParamReplaceable()) {
            return this.tagAddress();
        }

        return this.id;
    }

    /**
     * Returns the "reference" value ("<kind>:<author-pubkey>:<d-tag>") for this replaceable event.
     * @returns {string} The id
     */
    tagAddress(): string {
        if (!this.isParamReplaceable()) {
            throw new Error("This must only be called on replaceable events");
        }
        const dTagId = this.replaceableDTag();
        return `${this.kind}:${this.pubkey}:${dTagId}`;
    }

    /**
     * Determines the type of tag that can be used to reference this event from another event.
     * @returns {string} The tag type
     * @example
     * event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
     * event.tagType(); // "a"
     */
    tagType(): "e" | "a" {
        return this.isParamReplaceable() ? "a" : "e";
    }

    /**
     * Get the tag that can be used to reference this event from another event.
     *
     * Consider using referenceTags() instead (unless you have a good reason to use this)
     *
     * @example
     *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
     *     event.tagReference(); // ["a", "30000:pubkey:d-code"]
     *
     *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
     *     event.tagReference(); // ["e", "eventid"]
     * @returns {NDKTag} The NDKTag object referencing this event
     */
    tagReference(marker?: string): NDKTag {
        let tag: NDKTag;

        // NIP-33
        if (this.isParamReplaceable()) {
            tag = ["a", this.tagAddress()];
        } else {
            tag = ["e", this.tagId()];
        }

        if (this.relay) {
            tag.push(this.relay.url);
        } else {
            tag.push("");
        }

        if (marker) {
            tag.push(marker);
        }

        return tag;
    }

    /**
     * Get the tags that can be used to reference this event from another event
     * @param marker The marker to use in the tag
     * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event
     * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag
     * @example
     *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
     *     event.referenceTags(); // [["a", "30000:pubkey:d-code"], ["e", "parent-id"]]
     *
     *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
     *     event.referenceTags(); // [["e", "parent-id"]]
     * @returns {NDKTag} The NDKTag object referencing this event
     */
    referenceTags(marker?: string, skipAuthorTag?: boolean, forceTag?: string): NDKTag[] {
        let tags: NDKTag[] = [];

        // NIP-33
        if (this.isParamReplaceable()) {
            tags = [
                [forceTag ?? "a", this.tagAddress()],
                [forceTag ?? "e", this.id],
            ];
        } else {
            tags = [[forceTag ?? "e", this.id]];
        }

        // Add the relay url to all tags
        if (this.relay?.url) {
            tags = tags.map((tag) => {
                tag.push(this.relay?.url!);
                return tag;
            });
        } else if (marker) {
            tags = tags.map((tag) => {
                tag.push("");
                return tag;
            });
        }

        if (marker) {
            tags.forEach((tag) => tag.push(marker)); // Add the marker to both "a" and "e" tags
        }

        // NIP-29 h-tags
        tags = [...tags, ...this.getMatchingTags("h")];

        if (!skipAuthorTag) tags.push(...this.author.referenceTags());

        return tags;
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
     * Generates a deletion event of the current event
     *
     * @param reason The reason for the deletion
     * @param publish Whether to publish the deletion event automatically
     * @returns The deletion event
     */
    async delete(reason?: string, publish = true): Promise<NDKEvent> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const e = new NDKEvent(this.ndk, {
            kind: NDKKind.EventDeletion,
            content: reason || "",
        } as NostrEvent);
        e.tag(this, undefined, true);
        e.tags.push(["k", this.kind!.toString()]);
        if (publish) await e.publish();

        return e;
    }

    /**
     * Fetch an event tagged with the given tag following relay hints if provided.
     * @param tag The tag to search for
     * @param marker The marker to use in the tag (e.g. "root")
     * @returns The fetched event or null if no event was found, undefined if no matching tag was found in the event
     * * @example
     * const replyEvent = await ndk.fetchEvent("nevent1qqs8x8vnycyha73grv380gmvlury4wtmx0nr9a5ds2dngqwgu87wn6gpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgq3ql2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqz4cwjd")
     * const originalEvent = await replyEvent.fetchTaggedEvent("e", "reply");
     * console.log(replyEvent.encode() + " is a reply to event " + originalEvent?.encode());
     */
    public fetchTaggedEvent = fetchTaggedEvent.bind(this);

    /**
     * Fetch the root event of the current event.
     * @returns The fetched root event or null if no event was found
     * @example
     * const replyEvent = await ndk.fetchEvent("nevent1qqs8x8vnycyha73grv380gmvlury4wtmx0nr9a5ds2dngqwgu87wn6gpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgq3ql2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqz4cwjd")
     * const rootEvent = await replyEvent.fetchRootEvent();
     * console.log(replyEvent.encode() + " is a reply in the thread " + rootEvent?.encode());
     */
    public fetchRootEvent = fetchRootEvent.bind(this);

    /**
     * Fetch the event the current event is replying to.
     * @returns The fetched reply event or null if no event was found
     */
    public fetchReplyEvent = fetchReplyEvent.bind(this);

    /**
     * NIP-18 reposting event.
     *
     * @param publish Whether to publish the reposted event automatically @default true
     * @param signer The signer to use for signing the reposted event
     * @returns The reposted event
     *
     * @function
     */
    public repost = repost.bind(this);

    /**
     * React to an existing event
     *
     * @param content The content of the reaction
     */
    async react(content: string, publish: boolean = true): Promise<NDKEvent> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const e = new NDKEvent(this.ndk, {
            kind: NDKKind.Reaction,
            content,
        } as NostrEvent);
        e.tag(this);
        if (publish) {
            await e.publish();
        } else {
            await e.sign();
        }

        return e;
    }

    /**
     * Checks whether the event is valid per underlying NIPs.
     *
     * This method is meant to be overridden by subclasses that implement specific NIPs
     * to allow the enforcement of NIP-specific validation rules.
     *
     * Otherwise, it will only check for basic event properties.
     *
     */
    get isValid(): boolean {
        return this.validate();
    }
}
