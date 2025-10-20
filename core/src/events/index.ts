import { EventEmitter } from "tseep";

import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import { calculateRelaySetFromEvent } from "../relay/sets/calculate.js";
import type { NDKRelaySet } from "../relay/sets/index.js";
import type { NDKSigner } from "../signers/index.js";
import type { NDKFilter } from "../subscription/index.js";
import type { NDKUser } from "../user/index.js";
import { isValidPubkey } from "../utils/validation.js";
import { type ContentTag, generateContentTags, mergeTags } from "./content-tagger.js";
import { decrypt, encrypt } from "./encryption.js";
import { fetchReplyEvent, fetchRootEvent, fetchTaggedEvent } from "./fetch-tagged-event.js";
import { isEphemeral, isParamReplaceable, isReplaceable } from "./kind.js";
import { NDKKind } from "./kinds/index.js";
import { encode } from "./nip19.js";
import type { NIP73EntityType } from "./nip73.js";
import { repost } from "./repost.js";
import { deserialize, type NDKEventSerialized, serialize } from "./serializer.js";
import { getEventHash, validate, verifySignature } from "./validation.js";

const skipClientTagOnKinds = new Set([
    NDKKind.Metadata,
    NDKKind.EncryptedDirectMessage,
    NDKKind.GiftWrap,
    NDKKind.GiftWrapSeal,
    NDKKind.Contacts,
    NDKKind.ZapRequest,
    NDKKind.EventDeletion,
]);

export type NDKEventId = string;
export type NDKTag = string[];

export type ParsedContentMatch = {
    original: string;
    decoded: string;
    type: "npub" | "nprofile" | "note" | "nevent" | "naddr";
    data: any;
};

export type ContentTaggingOptions = {
    skipContentTagging?: boolean;
    pTagOnQTags?: boolean;
    pTagOnATags?: boolean;
    pTags?: boolean;
    copyPTagsFromTarget?: boolean;
    filters?: {
        includeTypes?: Array<"npub" | "nprofile" | "note" | "nevent" | "naddr" | "hashtag">;
        excludeTypes?: Array<"npub" | "nprofile" | "note" | "nevent" | "naddr" | "hashtag">;
    };
};

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
 * A finalized event
 */
export type NDKRawEvent = {
    created_at: number;
    content: string;
    tags: NDKTag[];
    kind: NDKKind | number;
    pubkey: string;
    id: string;
    sig: string;
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
    public kind: NDKKind | number;
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

    constructor(ndk?: NDK, event?: Partial<NDKRawEvent> | NDKEvent) {
        super();
        this.ndk = ndk;
        this.created_at = event?.created_at;
        this.content = event?.content || "";
        this.tags = event?.tags || [];
        this.id = event?.id || "";
        this.sig = event?.sig;
        this.pubkey = event?.pubkey || "";
        this.kind = event?.kind!;

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
    public rawEvent(): NDKRawEvent {
        return {
            created_at: this.created_at!,
            content: this.content,
            tags: this.tags,
            kind: this.kind,
            pubkey: this.pubkey,
            id: this.id,
            sig: this.sig!,
        };
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
     * NIP-73 tagging of external entities
     * @param entity to be tagged
     * @param type of the entity
     * @param markerUrl to be used as the marker URL
     *
     * @example
     * ```typescript
     * event.tagExternal("https://example.com/article/123#nostr", "url");
     * event.tags => [["i", "https://example.com/123"], ["k", "https://example.com"]]
     * ```
     *
     * @example tag a podcast:item:guid
     * ```typescript
     * event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:item:guid");
     * event.tags => [["i", "podcast:item:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5"], ["k", "podcast:item:guid"]]
     * ```
     *
     * @see https://github.com/nostr-protocol/nips/blob/master/73.md
     */
    public tagExternal(entity: string, type: NIP73EntityType, markerUrl?: string) {
        const iTag: NDKTag = ["i"];
        const kTag: NDKTag = ["k"];

        switch (type) {
            case "url": {
                const url = new URL(entity);
                url.hash = ""; // Remove the fragment
                iTag.push(url.toString());
                kTag.push(`${url.protocol}//${url.host}`);
                break;
            }
            case "hashtag":
                iTag.push(`#${entity.toLowerCase()}`);
                kTag.push("#");
                break;
            case "geohash":
                iTag.push(`geo:${entity.toLowerCase()}`);
                kTag.push("geo");
                break;
            case "isbn":
                iTag.push(`isbn:${entity.replace(/-/g, "")}`);
                kTag.push("isbn");
                break;
            case "podcast:guid":
                iTag.push(`podcast:guid:${entity}`);
                kTag.push("podcast:guid");
                break;
            case "podcast:item:guid":
                iTag.push(`podcast:item:guid:${entity}`);
                kTag.push("podcast:item:guid");
                break;
            case "podcast:publisher:guid":
                iTag.push(`podcast:publisher:guid:${entity}`);
                kTag.push("podcast:publisher:guid");
                break;
            case "isan":
                iTag.push(`isan:${entity.split("-").slice(0, 4).join("-")}`);
                kTag.push("isan");
                break;
            case "doi":
                iTag.push(`doi:${entity.toLowerCase()}`);
                kTag.push("doi");
                break;
            default:
                throw new Error(`Unsupported NIP-73 entity type: ${type}`);
        }

        if (markerUrl) {
            iTag.push(markerUrl);
        }

        this.tags.push(iTag);
        this.tags.push(kTag);
    }

    /**
     * Tag a user with an optional marker.
     * @param target What is to be tagged. Can be an NDKUser, NDKEvent, or an NDKTag.
     * @param marker The marker to use in the tag.
     * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event.
     * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag.
     * @param opts Optional content tagging options to control p tag behavior.
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
        forceTag?: string,
        opts?: ContentTaggingOptions,
    ): void {
        let tags: NDKTag[] = [];
        const isNDKUser = (target as NDKUser).fetchProfile !== undefined;

        if (isNDKUser) {
            forceTag ??= "p";
            // Only add p tag if not disabled
            if (forceTag === "p" && opts?.pTags === false) {
                return;
            }
            const tag = [forceTag, (target as NDKUser).pubkey];
            if (marker) tag.push(...["", marker]);
            tags.push(tag);
        } else if (target instanceof NDKEvent) {
            const event = target as NDKEvent;
            skipAuthorTag ??= event?.pubkey === this.pubkey;
            tags = event.referenceTags(marker, skipAuthorTag, forceTag, opts);

            // tag p-tags in the event if they are not the same as the user signing this event
            if (opts?.pTags !== false) {
                for (const pTag of event.getMatchingTags("p")) {
                    if (!pTag[1] || !isValidPubkey(pTag[1])) continue;
                    if (pTag[1] === this.pubkey) continue;
                    if (this.tags.find((t) => t[0] === "p" && t[1] === pTag[1])) continue;

                    this.tags.push(["p", pTag[1]]);
                }
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
     * @param opts {ContentTaggingOptions} Options for content tagging.
     * @returns {Promise<NostrEvent>} A promise that resolves to a NostrEvent.
     */
    async toNostrEvent(pubkey?: string, opts?: ContentTaggingOptions): Promise<NostrEvent> {
        if (!pubkey && this.pubkey === "") {
            const user = await this.ndk?.signer?.user();
            this.pubkey = user?.pubkey || "";
        }

        if (!this.created_at) {
            this.created_at = Math.floor(Date.now() / 1000);
        }

        const { content, tags } = await this.generateTags(opts);
        this.content = content || "";
        this.tags = tags;

        try {
            this.id = this.getEventHash();
            // eslint-disable-next-line no-empty
        } catch (_e) {}

        // if (this.id) nostrEvent.id = this.id;
        // if (this.sig) nostrEvent.sig = this.sig;

        return this.rawEvent();
    }

    public serialize = serialize.bind(this);
    public getEventHash = getEventHash.bind(this);
    public validate = validate.bind(this);
    public verifySignature = verifySignature.bind(this);
    /**
     * Is this event replaceable (whether parameterized or not)?
     *
     * This will return true for kind 0, 3, 10k-20k and 30k-40k
     */
    public isReplaceable = isReplaceable.bind(this);
    public isEphemeral = isEphemeral.bind(this);
    public isDvm = () => this.kind && this.kind >= 5000 && this.kind <= 7000;
    /**
     * Is this event parameterized replaceable?
     *
     * This will return true for kind 30k-40k
     */
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
    public tagValue(tagName: string, marker?: string): string | undefined {
        const tags = this.getMatchingTags(tagName, marker);
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
     * @param marker Optional marker to check for too
     *
     * @example
     * Remove a tags with a "defer" marker
     * ```typescript
     * event.tags = [
     *   ["a", "....", "defer"],
     *   ["a", "....", "no-defer"],
     * ]
     *
     * event.removeTag("a", "defer");
     *
     * // event.tags => [["a", "....", "no-defer"]]
     *
     * @returns {void}
     */
    public removeTag(tagName: string | string[], marker?: string): void {
        const tagNames = Array.isArray(tagName) ? tagName : [tagName];
        this.tags = this.tags.filter((tag) => {
            const include = tagNames.includes(tag[0]);
            const hasMarker = marker ? tag[3] === marker : true;

            return !(include && hasMarker);
        });
    }

    /**
     * Replace a tag with a new value. If not found, it will be added.
     * @param tag The tag to replace.
     * @param value The new value for the tag.
     */
    public replaceTag(tag: NDKTag): void {
        this.removeTag(tag[0]);
        this.tags.push(tag);
    }

    /**
     * Sign the event if a signer is present.
     *
     * It will generate tags.
     * Repleacable events will have their created_at field set to the current time.
     * @param signer {NDKSigner} The NDKSigner to use to sign the event
     * @param opts {ContentTaggingOptions} Options for content tagging.
     * @returns {Promise<string>} A Promise that resolves to the signature of the signed event.
     */
    public async sign(signer?: NDKSigner, opts?: ContentTaggingOptions): Promise<string> {
        this.ndk?.aiGuardrails?.event?.signing(this);

        if (!signer) {
            this.ndk?.assertSigner();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            signer = this.ndk?.signer!;
        } else {
            this.author = await signer.user();
        }

        const nostrEvent = await this.toNostrEvent(undefined, opts);
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
    public async publishReplaceable(relaySet?: NDKRelaySet, timeoutMs?: number, requiredRelayCount?: number) {
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
     * @param opts {ContentTaggingOptions} Options for content tagging.
     * @returns A promise that resolves to the relays the event was published to.
     */
    public async publish(
        relaySet?: NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number,
        opts?: ContentTaggingOptions,
    ): Promise<Set<NDKRelay>> {
        if (!requiredRelayCount) requiredRelayCount = 1;
        if (!this.sig) await this.sign(undefined, opts);
        if (!this.ndk) throw new Error("NDKEvent must be associated with an NDK instance to publish");

        this.ndk.aiGuardrails?.event?.publishing(this);

        if (!relaySet || relaySet.size === 0) {
            // If we have a devWriteRelaySet, use it to publish all events
            relaySet =
                this.ndk.devWriteRelaySet || (await calculateRelaySetFromEvent(this.ndk, this, requiredRelayCount));
        }

        // If the published event is a delete event, notify the cache if there is one
        if (this.kind === NDKKind.EventDeletion && this.ndk.cacheAdapter?.deleteEventIds) {
            const eTags = this.getMatchingTags("e").map((tag) => tag[1]);
            this.ndk.cacheAdapter.deleteEventIds(eTags);
        }

        const rawEvent = this.rawEvent();

        // add to cache for optimistic updates
        if (this.ndk.cacheAdapter?.addUnpublishedEvent && shouldTrackUnpublishedEvent(this)) {
            try {
                this.ndk.cacheAdapter.addUnpublishedEvent(this, relaySet.relayUrls);
            } catch (e) {
                console.error("Error adding unpublished event to cache", e);
            }
        }

        // if this is a delete event, send immediately to the cache
        if (this.kind === NDKKind.EventDeletion && this.ndk.cacheAdapter?.deleteEventIds) {
            this.ndk.cacheAdapter.deleteEventIds(this.getMatchingTags("e").map((tag) => tag[1]));
        }

        // send to active subscriptions that want this event
        this.ndk.subManager.dispatchEvent(rawEvent, undefined, true);

        const relays = await relaySet.publish(this, timeoutMs, requiredRelayCount);
        relays.forEach((relay) => this.ndk?.subManager.seenEvent(this.id, relay));

        return relays;
    }

    /**
     * Generates tags for users, notes, and other events tagged in content.
     * Will also generate random "d" tag for parameterized replaceable events where needed.
     * @param opts {ContentTaggingOptions} Options for content tagging.
     * @returns {ContentTag} The tags and content of the event.
     */
    async generateTags(opts?: ContentTaggingOptions): Promise<ContentTag> {
        let tags: NDKTag[] = [];

        // don't autogenerate if there currently are tags
        const g = await generateContentTags(this.content, this.tags, opts, this);
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
                    str = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${str}`;
                }

                tags.push(["d", str]);
            }
        }

        if (this.shouldAddClientTag) {
            const clientTag: NDKTag = ["client", this.ndk?.clientName ?? ""];
            if (this.ndk?.clientNip89) clientTag.push(this.ndk?.clientNip89);
            tags.push(clientTag);
        } else if (this.shouldStripClientTag) {
            tags = tags.filter((tag) => tag[0] !== "client");
        }

        return { content: content || "", tags };
    }

    get shouldAddClientTag(): boolean {
        if (!this.ndk?.clientName && !this.ndk?.clientNip89) return false;
        if (skipClientTagOnKinds.has(this.kind!)) return false;
        if (this.isEphemeral()) return false;
        if (this.isReplaceable() && !this.isParamReplaceable()) return false;
        if (this.isDvm()) return false;
        if (this.hasTag("client")) return false;
        return true;
    }

    get shouldStripClientTag(): boolean {
        return skipClientTagOnKinds.has(this.kind!);
    }

    public muted(): string | null {
        // Check if the event is muted using the muteFilter
        if (this.ndk?.muteFilter && this.ndk.muteFilter(this)) {
            // We can't determine the specific reason anymore without accessing the mute data
            // The muteFilter just returns true/false
            return "muted";
        }

        return null;
    }

    /**
     * Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
     * a parameterized replaceable event.
     * @returns {string} the "d" tag of the event.
     *
     * @deprecated Use `dTag` instead.
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
        if (this.kind === 0 || this.kind === 3 || (this.kind && this.kind >= 10000 && this.kind < 20000)) {
            return `${this.kind}:${this.pubkey}`;
        }
        return this.tagId();
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
     * Returns a stable reference value for a replaceable event.
     *
     * Param replaceable events are returned in the expected format of `<kind>:<pubkey>:<d-tag>`.
     * Kind-replaceable events are returned in the format of `<kind>:<pubkey>:`.
     *
     * @returns {string} A stable reference value for replaceable events
     */
    tagAddress(): string {
        if (this.isParamReplaceable()) {
            const dTagId = this.dTag ?? "";
            return `${this.kind}:${this.pubkey}:${dTagId}`;
        }
        if (this.isReplaceable()) {
            return `${this.kind}:${this.pubkey}:`;
        }

        throw new Error("Event is not a replaceable event");
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

        tag.push(marker ?? "");

        if (!this.isParamReplaceable()) {
            tag.push(this.pubkey);
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
    referenceTags(marker?: string, skipAuthorTag?: boolean, forceTag?: string, opts?: ContentTaggingOptions): NDKTag[] {
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
        tags = tags.map((tag) => {
            if (tag[0] === "e" || marker) {
                tag.push(this.relay?.url ?? "");
            } else if (this.relay?.url) {
                tag.push(this.relay?.url);
            }
            return tag;
        });

        // add marker and pubkey to e tags, and marker to a tags
        tags.forEach((tag) => {
            if (tag[0] === "e") {
                tag.push(marker ?? "");
                tag.push(this.pubkey);
            } else if (marker) {
                tag.push(marker);
            }
        });

        // NIP-29 h-tags
        tags = [...tags, ...this.getMatchingTags("h")];

        if (!skipAuthorTag && opts?.pTags !== false) tags.push(...this.author.referenceTags());

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
        }
        return { "#e": [this.tagId()] };
    }

    nip22Filter(): NDKFilter {
        if (this.isParamReplaceable()) {
            return { "#A": [this.tagId()] };
        }
        return { "#E": [this.tagId()] };
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
        e.tags.push(["k", this.kind?.toString()]);
        if (publish) {
            this.emit("deleted");
            await e.publish();
        }

        return e;
    }

    /**
     * Establishes whether this is a NIP-70-protectede event.
     * @@satisfies NIP-70
     */
    set isProtected(val: boolean) {
        this.removeTag("-");
        if (val) this.tags.push(["-"]);
    }

    /**
     * Whether this is a NIP-70-protected event.
     * @@satisfies NIP-70
     */
    get isProtected(): boolean {
        return this.hasTag("-");
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
    async react(content: string, publish = true): Promise<NDKEvent> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const e = new NDKEvent(this.ndk, {
            kind: NDKKind.Reaction,
            content,
        } as NostrEvent);
        e.tag(this);

        // add a [ "k", kind ] for all non-kind:1 events
        if (this.kind !== NDKKind.Text) {
            e.tags.push(["k", `${this.kind}`]);
        }

        if (publish) await e.publish();

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

    get inspect(): string {
        return JSON.stringify(this.rawEvent(), null, 4);
    }

    /**
     * Dump the event to console for debugging purposes.
     * Prints a JSON stringified version of rawEvent() with indentation
     * and also lists all relay URLs for onRelays.
     */
    public dump(): void {
        console.debug(JSON.stringify(this.rawEvent(), null, 4));
        console.debug("Event on relays:", this.onRelays.map((relay) => relay.url).join(", "));
    }

    /**
     * Creates a reply event for the current event.
     *
     * This function will use NIP-22 when appropriate (i.e. replies to non-kind:1 events).
     * This function does not have side-effects; it will just return an event with the appropriate tags
     * to generate the reply event; the caller is responsible for publishing the event.
     *
     * @param forceNip22 - Optional flag to force NIP-22 style replies (kind 1111) regardless of the original event's kind
     * @param opts - Optional content tagging options
     */
    public reply(forceNip22?: boolean, opts?: ContentTaggingOptions): NDKEvent {
        const reply = new NDKEvent(this.ndk);
        this.ndk?.aiGuardrails?.event?.creatingReply(reply);

        if (this.kind === 1 && !forceNip22) {
            reply.kind = 1;
            const opHasETag = this.hasTag("e");

            if (opHasETag) {
                reply.tags = [
                    ...reply.tags,
                    ...this.getMatchingTags("e"),
                    ...this.getMatchingTags("p"),
                    ...this.getMatchingTags("a"),
                    ...this.referenceTags("reply", false, undefined, opts),
                ];
            } else {
                reply.tag(this, "root", false, undefined, opts);
            }
        } else {
            reply.kind = NDKKind.GenericReply;

            const carryOverTags = ["A", "E", "I", "P"];
            const rootTags = this.tags.filter((tag) => carryOverTags.includes(tag[0]));

            // we have a root tag already
            if (rootTags.length > 0) {
                const rootKind = this.tagValue("K");
                reply.tags.push(...rootTags);
                if (rootKind) reply.tags.push(["K", rootKind]);

                // Build parent reference tag without marker for NIP-22
                let tag: NDKTag;
                if (this.isParamReplaceable()) {
                    tag = ["a", this.tagAddress()];
                    const relayHint = this.relay?.url ?? "";
                    if (relayHint) tag.push(relayHint);
                } else {
                    tag = ["e", this.tagId()];
                    const relayHint = this.relay?.url ?? "";
                    tag.push(relayHint);
                    tag.push(this.pubkey);
                }
                reply.tags.push(tag);
            } else {
                // Build NIP-22 compliant tags without markers
                let lowerTag: NDKTag;
                let upperTag: NDKTag;
                const relayHint = this.relay?.url ?? "";

                if (this.isParamReplaceable()) {
                    lowerTag = ["a", this.tagAddress(), relayHint];
                    upperTag = ["A", this.tagAddress(), relayHint];
                } else {
                    lowerTag = ["e", this.tagId(), relayHint, this.pubkey];
                    upperTag = ["E", this.tagId(), relayHint, this.pubkey];
                }

                reply.tags.push(lowerTag);
                reply.tags.push(upperTag);
                reply.tags.push(["K", this.kind?.toString()]);
                if (opts?.pTags !== false && opts?.pTagOnATags !== false) {
                    reply.tags.push(["P", this.pubkey]);
                }
            }

            reply.tags.push(["k", this.kind?.toString()]);

            // carry over all p tags if not disabled
            if (opts?.pTags !== false) {
                reply.tags.push(...this.getMatchingTags("p"));
                reply.tags.push(["p", this.pubkey]);
            }
        }

        return reply;
    }
}

const untrackedUnpublishedEvents = new Set([
    NDKKind.NostrConnect,
    NDKKind.NostrWaletConnectInfo,
    NDKKind.NostrWalletConnectReq,
    NDKKind.NostrWalletConnectRes,
]);

function shouldTrackUnpublishedEvent(event: NDKEvent): boolean {
    return !untrackedUnpublishedEvents.has(event.kind!);
}

/**
 * Discriminated union types for signed and unsigned events
 */

/**
 * An NDKEvent that has been signed and has all required fields for relay transmission
 */
export type NDKSignedEvent = NDKEvent & {
    readonly signed: true;
    id: string; // narrows string to required
    sig: string; // narrows string | undefined to required string
    created_at: number; // narrows number | undefined to required number
};

/**
 * An NDKEvent that has not been signed yet
 */
export type NDKUnsignedEvent = NDKEvent & {
    readonly signed: false;
    id?: string;
    sig?: string;
    created_at?: number;
};

/**
 * Union type representing either signed or unsigned NDKEvent
 */
export type NDKEventVariant = NDKSignedEvent | NDKUnsignedEvent;

/**
 * Type guard to check if an event is signed
 */
export function isSignedEvent(event: NDKEvent): event is NDKSignedEvent {
    return !!(event.sig && event.id && event.created_at && event.created_at > 0);
}

/**
 * Type guard to check if an event is unsigned
 */
export function isUnsignedEvent(event: NDKEvent): event is NDKUnsignedEvent {
    return !isSignedEvent(event);
}

/**
 * Assertion function for when you know an event must be signed
 */
export function assertSignedEvent(event: NDKEvent): asserts event is NDKSignedEvent {
    if (!isSignedEvent(event)) {
        throw new Error("Expected signed event but event is not signed");
    }
}

/**
 * Factory function to create a typed signed event (used internally by subscriptions)
 */
export function createSignedEvent(event: NDKEvent): NDKSignedEvent {
    if (!isSignedEvent(event)) {
        throw new Error("Cannot create signed event from unsigned event");
    }
    // TypeScript now knows this is NDKSignedEvent
    Object.defineProperty(event, "signed", { value: true, writable: false, enumerable: false });
    return event as NDKSignedEvent;
}
