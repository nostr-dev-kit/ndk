import { nip05, nip19 } from "nostr-tools";
import Event, { NDKTag, NostrEvent } from "../events/index.js";
import NDK, { NDKKind } from "../index.js";
import { NDKFilterOptions } from "../subscription/index.js";
import { follows } from "./follows.js";
import { mergeEvent, NDKUserProfile } from "./profile";
import NDKEvent from "../events/index.js";

export interface NDKUserParams {
    npub?: string;
    hexpubkey?: string;
    nip05?: string;
    relayUrls?: string[];
}

/**
 * Represents a pubkey.
 */
export default class NDKUser {
    public ndk: NDK | undefined;
    public profile?: NDKUserProfile;
    readonly npub: string = "";
    readonly relayUrls: string[] = [];

    public constructor(opts: NDKUserParams) {
        if (opts.npub) this.npub = opts.npub;

        if (opts.hexpubkey) {
            this.npub = nip19.npubEncode(opts.hexpubkey);
        }

        if (opts.relayUrls) {
            this.relayUrls = opts.relayUrls;
        }
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
                relayUrls: profile.relays
            });
        }
    }

    /**
     * Get the hexpubkey for a user
     * @returns {string} The user's hexpubkey
     */
    public hexpubkey(): string {
        return nip19.decode(this.npub).data as string;
    }

    /**
     * Fetch a user's kind 0 metadata events and merge the events in a single up-to-date profile
     * @param opts {NDKFilterOptions} A set of NDKFilterOptions
     * @returns {Promise<Set<Event>>} A set of all NDKEvents events returned for the given user
     */
    public async fetchProfile(opts?: NDKFilterOptions): Promise<Set<Event> | null> {
        if (!this.ndk) throw new Error("NDK not set");

        if (!this.profile) this.profile = {};

        const setMetadataEvents = await this.ndk.fetchEvents(
            {
                kinds: [0],
                authors: [this.hexpubkey()]
            },
            opts
        );

        if (setMetadataEvents) {
            // sort setMetadataEvents by created_at in ascending order
            const sortedSetMetadataEvents = Array.from(setMetadataEvents).sort(
                (a, b) => (a.created_at as number) - (b.created_at as number)
            );

            sortedSetMetadataEvents.forEach((event) => {
                try {
                    this.profile = mergeEvent(event, this.profile!);
                } catch (e) {}
            });
        }

        return setMetadataEvents;
    }

    /**
     * Returns a set of users that this user follows.
     */
    public follows = follows.bind(this);

    /**
     * Returns a set of relay list events for a user.
     * @returns {Promise<Set<Event>>} A set of NDKEvents returned for the given user.
     */
    public async relayList(): Promise<Set<Event>> {
        if (!this.ndk) throw new Error("NDK not set");

        const relayListEvents = await this.ndk.fetchEvents({
            kinds: [10002],
            authors: [this.hexpubkey()]
        });

        if (relayListEvents) {
            return relayListEvents;
        }

        return new Set<Event>();
    }

    /**
     * Get the tag that can be used to reference this user in an event
     * @returns {NDKTag} an NDKTag
     */
    public tagReference(): NDKTag {
        return ["p", this.hexpubkey()];
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

        const event = new NDKEvent(this.ndk, { kind: NDKKind.Contacts } as NostrEvent);

        // This is a horrible hack and I need to fix it
        for (const follow of currentFollowList) {
            event.tag(follow);
        }

        await event.publish();

        return true;
    }
}
