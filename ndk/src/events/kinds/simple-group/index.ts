import { NDKKind } from "..";
import { NDKEvent, NDKTag, NostrEvent } from "../..";
import { NDK } from "../../../ndk";
import { NDKRelaySet } from "../../../relay/sets";
import { Hexpubkey, NDKUser } from "../../../user";

type AddUserOpts = {
    /**
     * Whether to publish the event.
     * @default true
     */
    publish?: boolean;

    /**
     * Event to add the user to
     */
    currentUserListEvent?: NDKEvent;

    /**
     * An additional marker to add to the user/group relationship.
     * (e.g. tier, role, etc.)
     */
    marker?: string;

    /**
     * Whether to skip the user list event.
     * @default false
     */
    skipUserListEvent?: boolean;
};

export class NDKSimpleGroup {
    private ndk: NDK;
    readonly groupId: string;
    readonly relaySet: NDKRelaySet;

    constructor(ndk: NDK, groupId: string, relaySet: NDKRelaySet) {
        this.ndk = ndk;
        this.groupId = groupId;
        this.relaySet = relaySet;
    }

    /**
     * Adds a user to the group using a kind:9000 event
     * @param user user to add
     * @param opts options
     */
    async addUser(user: NDKUser): Promise<NDKEvent> {
        const addUserEvent = NDKSimpleGroup.generateAddUserEvent(user.pubkey, this.groupId);
        addUserEvent.ndk = this.ndk;
        const relays = await addUserEvent.publish(this.relaySet);
        return addUserEvent;
    }

    async getMemberListEvent(): Promise<NDKEvent | null> {
        const memberList = await this.ndk.fetchEvent(
            {
                kinds: [NDKKind.GroupMembers],
                "#d": [this.groupId],
            },
            undefined,
            this.relaySet
        );

        return memberList;
    }

    /**
     * Gets a list of users that belong to this group
     */
    async getMembers(): Promise<NDKUser[]> {
        const members: NDKUser[] = [];
        const memberPubkeys = new Set<Hexpubkey>();

        const memberListEvent = await this.getMemberListEvent();
        if (!memberListEvent) return [];

        for (const pTag of memberListEvent.getMatchingTags("p")) {
            const pubkey = pTag[1];
            if (memberPubkeys.has(pubkey)) continue;

            memberPubkeys.add(pubkey);
            try {
                members.push(this.ndk.getUser({ pubkey }));
            } catch {}
        }

        return members;
    }

    /**
     * Generates an event that lists the members of a group.
     * @param groupId
     * @returns
     */
    static generateUserListEvent(groupId: string) {
        const event = new NDKEvent(undefined, {
            kind: NDKKind.GroupMembers,
            tags: [
                ["h", groupId],
                ["alt", "Group Member List"],
            ],
        } as NostrEvent);

        return event;
    }

    /**
     * Generates an event that adds a user to a group.
     * @param userPubkey pubkey of the user to add
     * @param groupId group to add the user to
     * @returns
     */
    static generateAddUserEvent(userPubkey: string, groupId: string) {
        const event = new NDKEvent(undefined, {
            kind: NDKKind.GroupAdminAddUser,
            tags: [["h", groupId]],
        } as NostrEvent);
        event.tags.push(["p", userPubkey]);

        return event;
    }
}

// Remove a p tag of a user
const untagUser = (pubkey: Hexpubkey) => (tag: NDKTag) => !(tag[0] === "p" && tag[1] === pubkey);
