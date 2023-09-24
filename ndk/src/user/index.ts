import { nip05, nip19 } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/lib/nip19.js";
import { NDKEvent, NDKTag, NostrEvent } from "../events/index.js";
import { NDKRelayList } from "../events/kinds/NDKRelayList.js";
import { NDKKind } from "../events/kinds/index.js";
import { NDK } from "../ndk/index.js";
import { NDKRelay } from "../relay/index.js";
import { NDKRelaySet } from "../relay/sets/index.js";
import {
    NDKSubscriptionCacheUsage,
    NDKSubscriptionOptions,
} from "../subscription/index.js";
import { follows } from "./follows.js";
import { NDKUserProfile, profileFromEvent } from "./profile.js";

export type Hexpubkey = string;

export type Npub = string;

export interface NDKUserParams {
    npub?: Npub;
    hexpubkey?: Hexpubkey;
    nip05?: string;
    relayUrls?: string[];
}

/**
 * Represents a pubkey.
 */
export class NDKUser {
    public ndk: NDK | undefined;
    public profile?: NDKUserProfile;
    private _npub?: Npub;
    private _hexpubkey?: Hexpubkey;
    readonly relayUrls: string[] = [];

    public constructor(opts: NDKUserParams) {
        if (opts.npub) this._npub = opts.npub;

        if (opts.hexpubkey) this._hexpubkey = opts.hexpubkey;

        if (opts.relayUrls) {
            this.relayUrls = opts.relayUrls;
        }
    }

    get npub(): string {
        if (!this._npub) {
            if (!this._hexpubkey) throw new Error("hexpubkey not set");
            this._npub = nip19.npubEncode(this.hexpubkey);
        }

        return this._npub;
    }

    set npub(npub: Npub) {
        this._npub = npub;
    }

    get hexpubkey(): Hexpubkey {
        if (!this._hexpubkey) {
            if (!this._npub) throw new Error("npub not set");
            this._hexpubkey = nip19.decode(this.npub).data as Hexpubkey;
        }

        return this._hexpubkey;
    }

    set hexpubkey(hexpubkey: Hexpubkey) {
        this._hexpubkey = hexpubkey;
    }

    /**
     * Instantiate an NDKUser from a NIP-05 string
     * @param nip05Id {string} The user's NIP-05
     * @returns {NDKUser | undefined} An NDKUser if one is found for the given NIP-05, undefined otherwise.
     */
    static async fromNip05(nip05Id: string): Promise<NDKUser | undefined> {
        const profile = await nip05.queryProfile(nip05Id);

        if (profile) {
            return new NDKUser({
                hexpubkey: profile.pubkey,
                relayUrls: profile.relays,
            });
        }
    }

    /**
     * Fetch a user's profile
     * @param opts {NDKSubscriptionOptions} A set of NDKSubscriptionOptions
     * @returns User Profile
     */
    public async fetchProfile(
        opts?: NDKSubscriptionOptions
    ): Promise<NDKUserProfile | null> {
        if (!this.ndk) throw new Error("NDK not set");

        if (!this.profile) this.profile = {};

        let setMetadataEvents: Set<NDKEvent> | null = null;

        if (
            this.ndk.cacheAdapter &&
            this.ndk.cacheAdapter.fetchProfile &&
            opts?.cacheUsage !== NDKSubscriptionCacheUsage.ONLY_RELAY
        ) {
            const profile = await this.ndk.cacheAdapter.fetchProfile(
                this.hexpubkey
            );

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
                    authors: [this.hexpubkey],
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
                    authors: [this.hexpubkey],
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

        if (
            this.profile &&
            this.ndk.cacheAdapter &&
            this.ndk.cacheAdapter.saveProfile
        ) {
            this.ndk.cacheAdapter.saveProfile(this.hexpubkey, this.profile);
        }

        return this.profile;
    }

    /**
     * Returns a set of users that this user follows.
     */
    public follows = follows.bind(this);

    /**
     * Returns a set of relay list events for a user.
     * @returns {Promise<Set<NDKEvent>>} A set of NDKEvents returned for the given user.
     */
    public async relayList(): Promise<NDKRelayList | undefined> {
        if (!this.ndk) throw new Error("NDK not set");

        const pool = this.ndk.outboxPool || this.ndk.pool;
        const set = new Set<NDKRelay>();

        for (const relay of pool.relays.values()) set.add(relay);

        const relaySet = new NDKRelaySet(set, this.ndk);
        const event = await this.ndk.fetchEvent(
            {
                kinds: [10002],
                authors: [this.hexpubkey],
            },
            { closeOnEose: true, pool, groupable: true },
            relaySet
        );

        if (event) return NDKRelayList.from(event);

        return undefined;
    }

    /**
     * Get the tag that can be used to reference this user in an event
     * @returns {NDKTag} an NDKTag
     */
    public tagReference(): NDKTag {
        return ["p", this.hexpubkey];
    }

    /**
     * Publishes the current profile.
     */
    public async publish() {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        const event = new NDKEvent(this.ndk, {
            kind: 0,
            content: JSON.stringify(this.profile),
        } as NostrEvent);
        await event.publish();
    }

    /**
     * Add a follow to this user's contact list
     *
     * @param newFollow {NDKUser} The user to follow
     * @param currentFollowList {Set<NDKUser>} The current follow list
     * @returns {Promise<boolean>} True if the follow was added, false if the follow already exists
     */
    public async follow(
        newFollow: NDKUser,
        currentFollowList?: Set<NDKUser>
    ): Promise<boolean> {
        if (!this.ndk) throw new Error("No NDK instance found");

        this.ndk.assertSigner();

        if (!currentFollowList) {
            currentFollowList = await this.follows();
        }

        if (currentFollowList.has(newFollow)) {
            return false;
        }

        currentFollowList.add(newFollow);

        const event = new NDKEvent(this.ndk, {
            kind: NDKKind.Contacts,
        } as NostrEvent);

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
     * @returns {Promise<boolean | null>} True if the NIP-05 is found and matches this user's hexpubkey,
     * False if the NIP-05 is found but doesn't match this user's hexpubkey,
     * null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)
     */
    public async validateNip05(nip05Id: string): Promise<boolean | null> {
        if (!this.ndk) throw new Error("No NDK instance found");

        const profilePointer: ProfilePointer | null =
            await nip05.queryProfile(nip05Id);

        if (profilePointer === null) return null;
        return profilePointer.pubkey === this.hexpubkey;
    }
}
