import { nip19 } from "nostr-tools";

import { NDKEvent, type NDKTag, type NostrEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import type { NDK } from "../ndk/index.js";
import { NDKSubscriptionCacheUsage, type NDKSubscriptionOptions } from "../subscription/index.js";
import { follows } from "./follows.js";
import { type NDKUserProfile, profileFromEvent, serializeProfile } from "./profile.js";
import type { NDKSigner } from "../signers/index.js";
import Zap from "../zap/index.js";
import { getNip05For } from "./nip05.js";

export type Hexpubkey = string;

export type Npub = string;

// @ignore
export type ProfilePointer = {
    pubkey: string;
    relays?: string[];
    nip46?: string[];
};

// @ignore
export type EventPointer = {
    id: string;
    relays?: string[];
    author?: string;
    kind?: number;
};

export interface NDKUserParams {
    npub?: Npub;
    hexpubkey?: Hexpubkey;
    pubkey?: Hexpubkey;
    nip05?: string;
    relayUrls?: string[];
    nip46Urls?: string[];
}

/**
 * Represents a pubkey.
 */
export class NDKUser {
    public ndk: NDK | undefined;
    public profile?: NDKUserProfile;
    private _npub?: Npub;
    private _pubkey?: Hexpubkey;
    readonly relayUrls: string[] = [];
    readonly nip46Urls: string[] = [];

    public constructor(opts: NDKUserParams) {
        if (opts.npub) this._npub = opts.npub;

        if (opts.hexpubkey) this._pubkey = opts.hexpubkey;
        if (opts.pubkey) this._pubkey = opts.pubkey;

        if (opts.relayUrls) this.relayUrls = opts.relayUrls;
        if (opts.nip46Urls) this.nip46Urls = opts.nip46Urls;
    }

    get npub(): string {
        if (!this._npub) {
            if (!this._pubkey) throw new Error("hexpubkey not set");
            this._npub = nip19.npubEncode(this.pubkey);
        }

        return this._npub;
    }

    set npub(npub: Npub) {
        this._npub = npub;
    }

    /**
     * Get the user's hexpubkey
     * @returns {Hexpubkey} The user's hexpubkey
     *
     * @deprecated Use `pubkey` instead
     */
    get hexpubkey(): Hexpubkey {
        return this.pubkey;
    }

    /**
     * Set the user's hexpubkey
     * @param pubkey {Hexpubkey} The user's hexpubkey
     * @deprecated Use `pubkey` instead
     */
    set hexpubkey(pubkey: Hexpubkey) {
        this._pubkey = pubkey;
    }

    /**
     * Get the user's pubkey
     * @returns {string} The user's pubkey
     */
    get pubkey(): string {
        if (!this._pubkey) {
            if (!this._npub) throw new Error("npub not set");
            this._pubkey = nip19.decode(this.npub).data as Hexpubkey;
        }

        return this._pubkey;
    }

    /**
     * Set the user's pubkey
     * @param pubkey {string} The user's pubkey
     */
    set pubkey(pubkey: string) {
        this._pubkey = pubkey;
    }

    /**
     * Instantiate an NDKUser from a NIP-05 string
     * @param nip05Id {string} The user's NIP-05
     * @param ndk {NDK} An NDK instance
     * @param skipCache {boolean} Whether to skip the cache or not
     * @returns {NDKUser | undefined} An NDKUser if one is found for the given NIP-05, undefined otherwise.
     */
    static async fromNip05(
        nip05Id: string,
        ndk?: NDK,
        skipCache = false
    ): Promise<NDKUser | undefined> {
        // If we have a cache, try to load from cache first
        if (ndk?.cacheAdapter && ndk.cacheAdapter.loadNip05) {
            const profile = await ndk.cacheAdapter.loadNip05(nip05Id);

            if (profile) {
                const user = new NDKUser({
                    pubkey: profile.pubkey,
                    relayUrls: profile.relays,
                    nip46Urls: profile.nip46,
                });
                user.ndk = ndk;
                return user;
            }
        }

        let opts: RequestInit = {};

        if (skipCache) opts.cache = "no-cache";
        const profile = await getNip05For(nip05Id, ndk?.httpFetch, opts);

        // Save the nip05 mapping
        if (profile && ndk?.cacheAdapter && ndk.cacheAdapter.saveNip05) {
            ndk?.cacheAdapter.saveNip05(nip05Id, profile);
        }

        if (profile) {
            const user = new NDKUser({
                pubkey: profile.pubkey,
                relayUrls: profile.relays,
                nip46Urls: profile.nip46,
            });
            user.ndk = ndk;
            return user;
        }
    }

    /**
     * Fetch a user's profile
     * @param opts {NDKSubscriptionOptions} A set of NDKSubscriptionOptions
     * @returns User Profile
     */
    public async fetchProfile(opts?: NDKSubscriptionOptions): Promise<NDKUserProfile | null> {
        if (!this.ndk) throw new Error("NDK not set");

        if (!this.profile) this.profile = {};

        let setMetadataEvents: Set<NDKEvent> | null = null;

        if (
            this.ndk.cacheAdapter &&
            this.ndk.cacheAdapter.fetchProfile &&
            opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_RELAY
        ) {
            const profile = await this.ndk.cacheAdapter.fetchProfile(this.pubkey);

            if (profile) {
                this.profile = profile;
                return profile;
            }
        }

        // if no options have been set and we have a cache, try to load from cache with no grouping
        // This is done in favour of simply using NDKSubscriptionCacheUsage.CACHE_FIRST since
        // we want to avoid depending on the grouping, arguably, all queries should go through this
        // type of behavior when we have a locking cache
        if (
            !opts && // if no options have been set
            this.ndk.cacheAdapter && // and we have a cache
            this.ndk.cacheAdapter.locking // and the cache identifies itself as fast 😂
        ) {
            setMetadataEvents = await this.ndk.fetchEvents(
                {
                    kinds: [0],
                    authors: [this.pubkey],
                },
                {
                    cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
                    closeOnEose: true,
                    groupable: false,
                }
            );

            opts = {
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
                closeOnEose: true,
                groupable: true,
                groupableDelay: 250,
            };
        }

        if (!setMetadataEvents || setMetadataEvents.size === 0) {
            setMetadataEvents = await this.ndk.fetchEvents(
                {
                    kinds: [0],
                    authors: [this.pubkey],
                },
                opts
            );
        }

        const sortedSetMetadataEvents = Array.from(setMetadataEvents).sort(
            (a, b) => (a.created_at as number) - (b.created_at as number)
        );

        if (sortedSetMetadataEvents.length === 0) return null;

        // return the most recent profile
        this.profile = profileFromEvent(sortedSetMetadataEvents[0]);

        if (this.profile && this.ndk.cacheAdapter && this.ndk.cacheAdapter.saveProfile) {
            this.ndk.cacheAdapter.saveProfile(this.pubkey, this.profile);
        }

        return this.profile;
    }

    /**
     * Returns a set of users that this user follows.
     */
    public follows = follows.bind(this);

    /** @deprecated Use referenceTags instead. */
    /**
     * Get the tag that can be used to reference this user in an event
     * @returns {NDKTag} an NDKTag
     */
    public tagReference(): NDKTag {
        return ["p", this.pubkey];
    }

    /**
     * Get the tags that can be used to reference this user in an event
     * @returns {NDKTag[]} an array of NDKTag
     */
    public referenceTags(marker?: string): NDKTag[] {
        const tag = [["p", this.pubkey]];
        if (!marker) return tag;

        // TODO: Locate this pubkey's relay
        tag[0].push("", marker);
        return tag;
    }

    /**
     * Publishes the current profile.
     */
    public async publish() {
        if (!this.ndk) throw new Error("No NDK instance found");
        if (!this.profile) throw new Error("No profile available");

        this.ndk.assertSigner();

        const event = new NDKEvent(this.ndk, {
            kind: 0,
            content: serializeProfile(this.profile),
        } as NostrEvent);
        await event.publish();
    }

    /**
     * Add a follow to this user's contact list
     *
     * @param newFollow {NDKUser} The user to follow
     * @param currentFollowList {Set<NDKUser>} The current follow list
     * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
     * @returns {Promise<boolean>} True if the follow was added, false if the follow already exists
     */
    public async follow(
        newFollow: NDKUser,
        currentFollowList?: Set<NDKUser>,
        kind = NDKKind.Contacts
    ): Promise<boolean> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        if (!currentFollowList) {
            currentFollowList = await this.follows(undefined, undefined, kind);
        }

        if (currentFollowList.has(newFollow)) {
            return false;
        }

        currentFollowList.add(newFollow);

        const event = new NDKEvent(this.ndk, { kind } as NostrEvent);

        // This is a horrible hack and I need to fix it
        for (const follow of currentFollowList) {
            event.tag(follow);
        }

        await event.publish();
        return true;
    }

    /**
     * Validate a user's NIP-05 identifier (usually fetched from their kind:0 profile data)
     *
     * @param nip05Id The NIP-05 string to validate
     * @returns {Promise<boolean | null>} True if the NIP-05 is found and matches this user's pubkey,
     * False if the NIP-05 is found but doesn't match this user's pubkey,
     * null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)
     */
    public async validateNip05(nip05Id: string): Promise<boolean | null> {
        if (!this.ndk) throw new Error("No NDK instance found");

        const profilePointer: ProfilePointer | null = await getNip05For(nip05Id);

        if (profilePointer === null) return null;
        return profilePointer.pubkey === this.pubkey;
    }

    /**
     * Zap a user
     *
     * @param amount The amount to zap in millisatoshis
     * @param comment A comment to add to the zap request
     * @param extraTags Extra tags to add to the zap request
     * @param signer The signer to use (will default to the NDK instance's signer)
     */
    async zap(
        amount: number,
        comment?: string,
        extraTags?: NDKTag[],
        signer?: NDKSigner
    ): Promise<string | null> {
        if (!this.ndk) throw new Error("No NDK instance found");

        if (!signer) {
            this.ndk.assertSigner();
        }

        const zap = new Zap({
            ndk: this.ndk,
            zappedUser: this,
        });

        const relays = Array.from(this.ndk.pool.relays.keys());

        const paymentRequest = await zap.createZapRequest(
            amount,
            comment,
            extraTags,
            relays,
            signer
        );
        return paymentRequest;
    }
}
