import { nip19 } from "nostr-tools";

import { NDKEvent, type NDKTag, type NostrEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import type { NDK } from "../ndk/index.js";
import { NDKSubscriptionCacheUsage, type NDKSubscriptionOptions } from "../subscription/index.js";
import { follows } from "./follows.js";
import { type NDKUserProfile, profileFromEvent, serializeProfile } from "./profile.js";
import { getNip05For } from "./nip05.js";
import type { NDKFilter, NDKRelay, NDKZapMethod, NDKZapMethodInfo } from "../index.js";
import { NDKCashuMintList } from "../events/kinds/nutzap/mint-list.js";

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
    nprofile?: string;
}

/**
 * Represents a pubkey.
 */
export class NDKUser {
    public ndk: NDK | undefined;
    public profile?: NDKUserProfile;
    public profileEvent?: NDKEvent;
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

        if (opts.nprofile) {
            try {
                const decoded = nip19.decode(opts.nprofile);
                if (decoded.type === "nprofile") {
                    this._pubkey = decoded.data.pubkey;
                    if (decoded.data.relays && decoded.data.relays.length > 0) {
                        this.relayUrls.push(...decoded.data.relays);
                    }
                }
            } catch (e) {
                console.error("Failed to decode nprofile", e);
            }
        }
    }

    get npub(): string {
        if (!this._npub) {
            if (!this._pubkey) throw new Error("pubkey not set");
            this._npub = nip19.npubEncode(this.pubkey);
        }

        return this._npub;
    }

    get nprofile(): string {
        const relays = this.profileEvent?.onRelays?.map((r) => r.url);
        return nip19.nprofileEncode({
            pubkey: this.pubkey,
            relays,
        });
    }

    set npub(npub: Npub) {
        this._npub = npub;
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
     * Equivalent to NDKEvent.filters().
     * @returns {NDKFilter}
     */
    public filter(): NDKFilter {
        return { "#p": [this.pubkey] };
    }

    /**
     * Gets NIP-57 and NIP-61 information that this user has signaled
     *
     * @param getAll {boolean} Whether to get all zap info or just the first one
     */
    async getZapInfo(timeoutMs?: number): Promise<Map<NDKZapMethod, NDKZapMethodInfo>> {
        if (!this.ndk) throw new Error("No NDK instance found");

        const promiseWithTimeout = async <T>(promise: Promise<T>): Promise<T | undefined> => {
            if (!timeoutMs) return promise;

            let timeoutId: NodeJS.Timeout | undefined;
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
            });

            try {
                console.log("Starting promise with timeout:", timeoutMs);
                const result = await Promise.race([promise, timeoutPromise]);
                console.log("Promise resolved with result:", result);
                if (timeoutId) clearTimeout(timeoutId);
                return result;
            } catch (e) {
                console.log("Promise error:", e);
                if (e instanceof Error && e.message === "Timeout") {
                    console.log("Promise timed out, waiting for original promise");
                    try {
                        const result = await promise;
                        console.log("Original promise resolved with:", result);
                        return result;
                    } catch (originalError) {
                        console.log("Original promise failed:", originalError);
                        return undefined;
                    }
                }
                return undefined;
            }
        };

        console.log("Starting Promise.all");
        const [userProfile, mintListEvent] = await Promise.all([
            promiseWithTimeout(this.fetchProfile()),
            promiseWithTimeout(
                this.ndk.fetchEvent({ kinds: [NDKKind.CashuMintList], authors: [this.pubkey] })
            ),
        ]);
        console.log(
            "Promise.all completed. userProfile:",
            userProfile,
            "mintListEvent:",
            mintListEvent
        );

        const res: Map<NDKZapMethod, NDKZapMethodInfo> = new Map();

        if (mintListEvent) {
            const mintList = NDKCashuMintList.from(mintListEvent);

            if (mintList.mints.length > 0) {
                res.set("nip61", {
                    mints: mintList.mints,
                    relays: mintList.relays,
                    p2pk: mintList.p2pk,
                });
            }
        }

        if (userProfile) {
            const { lud06, lud16 } = userProfile;
            console.log("Setting nip57 with:", { lud06, lud16 });
            res.set("nip57", { lud06, lud16 });
        }

        console.log("Returning result map:", res);
        return res;
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

        const opts: RequestInit = {};

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

        let setMetadataEvent: NDKEvent | null = null;

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
            setMetadataEvent = await this.ndk.fetchEvent(
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

        if (!setMetadataEvent) {
            setMetadataEvent = await this.ndk.fetchEvent(
                {
                    kinds: [0],
                    authors: [this.pubkey],
                },
                opts
            );
        }

        if (!setMetadataEvent) return null;

        // return the most recent profile
        this.profile = profileFromEvent(setMetadataEvent);

        if (storeProfileEvent) {
            // Store the event as a stringified JSON
            this.profile.profileEvent = JSON.stringify(setMetadataEvent);
        }

        if (this.profile && this.ndk.cacheAdapter && this.ndk.cacheAdapter.saveProfile) {
            this.ndk.cacheAdapter.saveProfile(this.pubkey, this.profile);
        }

        return this.profile;
    }

    /**
     * Returns a set of users that this user follows.
     *
     * @deprecated Use followSet instead
     */
    public follows = follows.bind(this);

    /**
     * Returns a set of pubkeys that this user follows.
     *
     * @param opts - NDKSubscriptionOptions
     * @param outbox - boolean
     * @param kind - number
     */
    public async followSet(
        opts?: NDKSubscriptionOptions,
        outbox?: boolean,
        kind: number = NDKKind.Contacts
    ): Promise<Set<Hexpubkey>> {
        const follows = await this.follows(opts, outbox, kind);
        return new Set(Array.from(follows).map((f) => f.pubkey));
    }

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
}
