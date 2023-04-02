import {nip05, nip19} from 'nostr-tools';
import Event from '../events/index';
import {NDKUserProfile, mergeEvent} from './profile';
import NDK from '../index';

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
    readonly npub: string = '';
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

    static async fromNip05(nip05Id: string): Promise<NDKUser | undefined> {
        const profile = await nip05.queryProfile(nip05Id);

        if (profile) {
            return new NDKUser({
                hexpubkey: profile.pubkey,
                relayUrls: profile.relays,
            });
        }
    }

    public hexpubkey(): string {
        return nip19.decode(this.npub).data as string;
    }

    public async fetchProfile(): Promise<Set<Event> | null> {
        if (!this.ndk) throw new Error('NDK not set');

        if (!this.profile) this.profile = {};

        const setMetadataEvents = await this.ndk.fetchEvents({
            kinds: [0],
            authors: [this.hexpubkey()],
        });

        if (setMetadataEvents) {
            // sort setMetadataEvents by created_at in ascending order
            const sortedSetMetadataEvents = Array.from(setMetadataEvents).sort(
                (a, b) => (a.created_at as number) - (b.created_at as number)
            );

            sortedSetMetadataEvents.forEach(event => {
                this.profile = mergeEvent(event, this.profile!);
            });
        }

        return setMetadataEvents;
    }

    /**
     * Returns a set of users that this user follows.
     */
    public async follows(): Promise<Set<NDKUser>> {
        if (!this.ndk) throw new Error('NDK not set');

        const contactListEvents = await this.ndk.fetchEvents({
            kinds: [3],
            authors: [this.hexpubkey()],
        });

        if (contactListEvents) {
            const contactList = new Set<NDKUser>();

            contactListEvents.forEach(event => {
                event.tags.forEach((tag: string[]) => {
                    if (tag[0] === 'p') {
                        const user = new NDKUser({hexpubkey: tag[1]});
                        user.ndk = this.ndk;
                        contactList.add(user);
                    }
                });
            });

            return contactList;
        }

        return new Set<NDKUser>();
    }

    public async relayList(): Promise<Set<Event>> {
        if (!this.ndk) throw new Error('NDK not set');

        const relayListEvents = await this.ndk.fetchEvents({
            kinds: [10002],
            authors: [this.hexpubkey()],
        });

        if (relayListEvents) {
            return relayListEvents;
        }

        return new Set<Event>();
    }
}
