import { nip19 } from "nostr-tools";

import { NDKEvent, type NDKTag, type NostrEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import type { NDK } from "../ndk/index.js";
import { NDKSubscriptionCacheUsage, type NDKSubscriptionOptions } from "../subscription/index.js";
import { follows } from "./follows.js";
import { type NDKUserProfile, profileFromEvent, serializeProfile } from "./profile.js";
import type { NDKSigner } from "../signers/index.js";
import { getNip05For } from "./nip05.js";
import { LnPaymentInfo, NDKLnUrlData, NDKRelay, NDKZap, NDKZapMethod, NDKZapMethodInfo, NDKZapPaymentDetails, NDKZapper } from "../index.js";
import { NDKCashuMintList } from "../events/kinds/nutzap/mint-list.js";
import { getNip57ZapSpecFromLud } from "../zapper/ln.js";

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
            if (!this._pubkey) throw new Error("pubkey not set");
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
     * Gets NIP-57 and NIP-61 information that this user has signaled
     * 
     * @param getAll {boolean} Whether to get all zap info or just the first one
     */
    async getZapInfo(
        getAll = true,
        methods: NDKZapMethod[] = [ "nip61", "nip57"]
    ): Promise<NDKZapMethodInfo[]> {
        if (!this.ndk) throw new Error("No NDK instance found");

        const kinds: NDKKind[] = [];

        if (methods.includes("nip61")) kinds.push(NDKKind.CashuMintList);
        if (methods.includes("nip57")) kinds.push(NDKKind.Metadata);

        if (kinds.length === 0) return [];

        let events = await this.ndk.fetchEvents({ kinds, authors: [this.pubkey] }, {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE, groupable: false
        });

        if (events.size === 0) {
            events = await this.ndk.fetchEvents({ kinds, authors: [this.pubkey] }, {
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
            });
        }

        const res: NDKZapMethodInfo[] = [];

        const nip61 = Array.from(events).find(e => e.kind === NDKKind.CashuMintList);
        const nip57 = Array.from(events).find(e => e.kind === NDKKind.Metadata);

        if (nip61) {
            const mintList = NDKCashuMintList.from(nip61);

            if (mintList.mints.length > 0) {
                res.push({
                    type: "nip61",
                    data: { mints: mintList.mints, relays: mintList.relays, p2pkPubkey: mintList.p2pkPubkey }
                });
            }

            // if we are just getting one and already have one, go back
            if (!getAll) return res;
        }

        if (nip57) {
            const profile = profileFromEvent(nip57);
            const { lud06, lud16 } = profile;
            console.log("lud06", lud06, "lud16", lud16, profile, nip57.rawEvent());
            const zapSpec = await getNip57ZapSpecFromLud({lud06, lud16}, this.ndk);

            if (zapSpec) {
                res.push({ type: "nip57", data: zapSpec });
            }
        }

        return res;
    }

    /**
     * Determines whether this user
     * has signaled support for NIP-60 zaps
     **/
    // export type UserZapConfiguration = {

    // }
    // async getRecipientZapConfig(): Promise<> {
        
    // }

    /**
     * Retrieves the zapper this pubkey has designated as an issuer of zap receipts
     */
    async getZapConfiguration(ndk?: NDK): Promise<NDKLnUrlData | undefined> {
        ndk ??= this.ndk;

        if (!ndk) throw new Error("No NDK instance found");

        const process = async (): Promise<NDKLnUrlData | undefined> => {
            if (this.ndk?.cacheAdapter?.loadUsersLNURLDoc) {
                const doc = await this.ndk.cacheAdapter.loadUsersLNURLDoc(this.pubkey);

                if (doc !== "missing") {
                    if (doc === null) return;
                    if (doc) return doc;
                }
            }

            const zap = new NDKZap({ ndk: ndk!, zappedUser: this });
            let lnurlspec: NDKLnUrlData | undefined;
            try {
                await this.fetchProfile({ groupable: false });
                if (this.profile) {
                    const { lud06, lud16 } = this.profile;
                    lnurlspec = await getNip57ZapSpecFromLud({lud06, lud16}, ndk);
                }
            } catch {}

            if (this.ndk?.cacheAdapter?.saveUsersLNURLDoc) {
                this.ndk.cacheAdapter.saveUsersLNURLDoc(this.pubkey, lnurlspec || null);
            }

            if (!lnurlspec) return;

            return lnurlspec;
        };

        return await ndk.queuesZapConfig.add({
            id: this.pubkey,
            func: process,
        });
    }

    /**
     * Fetches the zapper's pubkey for the zapped user
     * @returns The zapper's pubkey if one can be found
     */
    async getZapperPubkey(): Promise<Hexpubkey | undefined> {
        const zapConfig = await this.getZapConfiguration();

        return zapConfig?.nostrPubkey;
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
        ndk: NDK,
        skipCache = false
    ): Promise<NDKUser | undefined> {
        if (!ndk) throw new Error("No NDK instance found");

        let opts: RequestInit = {};

        if (skipCache) opts.cache = "no-cache";
        const profile = await getNip05For(ndk, nip05Id, ndk?.httpFetch, opts);

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
     * @param storeProfileEvent {boolean} Whether to store the profile event or not
     * @returns User Profile
     */
    public async fetchProfile(
        opts?: NDKSubscriptionOptions,
        storeProfileEvent: boolean = false
    ): Promise<NDKUserProfile | null> {
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
        const event = sortedSetMetadataEvents[0];
        this.profile = profileFromEvent(event);

        if (storeProfileEvent) {
            // Store the event as a stringified JSON
            this.profile.profileEvent = JSON.stringify(event);
        }

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
     * Remove a follow from this user's contact list
     *
     * @param user {NDKUser} The user to unfollow
     * @param currentFollowList {Set<NDKUser>} The current follow list
     * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
     * @returns The relays were the follow list was published or false if the user wasn't found
     */
    public async unfollow(
        user: NDKUser,
        currentFollowList?: Set<NDKUser>,
        kind = NDKKind.Contacts
    ): Promise<Set<NDKRelay> | boolean> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        if (!currentFollowList) {
            currentFollowList = await this.follows(undefined, undefined, kind);
        }

        // find the user that has the same pubkey
        const newUserFollowList = new Set<NDKUser>();
        let foundUser = false;
        for (const follow of currentFollowList) {
            if (follow.pubkey !== user.pubkey) {
                newUserFollowList.add(follow);
            } else {
                foundUser = true;
            }
        }

        if (!foundUser) return false;

        const event = new NDKEvent(this.ndk, { kind } as NostrEvent);

        // Tag users from the new follow list
        for (const follow of newUserFollowList) {
            event.tag(follow);
        }

        return await event.publish();
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

        const profilePointer: ProfilePointer | null = await getNip05For(this.ndk, nip05Id);

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

        const zap = new NDKZapper(
            this,
            amount,
            "msat",
            comment,
            this.ndk,
            extraTags,
            signer
        );

        return new Promise((resolve, reject) => {
            zap.onLnPay = async (payment: NDKZapPaymentDetails) => {
                resolve((payment.info as LnPaymentInfo).pr);
                return false;
            };
            
            zap.zap();
        });

        // const relays = Array.from(this.ndk.pool.relays.keys());

        // zap.
    }
}
