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
    publish?: boolean,

    /**
     * Event to add the user to
     */
    currentUserListEvent?: NDKEvent,

    /**
     * An additional marker to add to the user/group relationship.
     * (e.g. tier, role, etc.)
     */
    marker?: string,

    /**
     * Whether to skip the user list event.
     * @default false
     */
    skipUserListEvent?: boolean,
}

export class NDKSimpleGroup {
    private ndk: NDK;
    readonly groupId: string;
    readonly relaySet: NDKRelaySet;

    constructor(
        ndk: NDK,
        groupId: string,
        relaySet: NDKRelaySet,
    ) {
        this.ndk = ndk;
        this.groupId = groupId;
        this.relaySet = relaySet;
    }

    /**
     * Adds a user to the group.
     * @param user user to add
     * @param opts options
     */
    async addUser(
        user: NDKUser,
        opts: AddUserOpts = {
            publish: true,
            skipUserListEvent: false,
        }
    ): Promise<{ addUserEvent: NDKEvent, currentUserListEvent?: NDKEvent }> {
        const addUserEvent = NDKSimpleGroup.generateAddUserEvent(user.pubkey, this.groupId);
        addUserEvent.ndk = this.ndk;

        let currentUserListEvent = opts.currentUserListEvent;
        if (!opts.skipUserListEvent) {
            currentUserListEvent ??= (
                await this.getMemberListEvent() ||
                NDKSimpleGroup.generateUserListEvent(this.groupId)
            );
            // Check if the user is already in the group
            currentUserListEvent.tags = currentUserListEvent.tags.filter(untagUser(user.pubkey));
            currentUserListEvent.tag(user, opts.marker);
        }


        if (opts?.publish ?? true) {
            const promises = [addUserEvent.publish(this.relaySet)];

            if (!opts.skipUserListEvent && currentUserListEvent) {
                promises.push(currentUserListEvent.publish(this.relaySet));
            }

            await Promise.all(promises);
        }

        return {
            addUserEvent,
            currentUserListEvent,
        }
    }

    async getMemberListEvent(): Promise<NDKEvent | null> {
        const memberList = await this.ndk.fetchEvent({
            kinds: [NDKKind.GroupMembers],
            "#h": [this.groupId],
        }, undefined, this.relaySet);

        return memberList;
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
                [ "h", groupId ],
                [ "alt", "Group Member List" ],
            ]
        } as NostrEvent);

        return event;
    }

    /**
     * Generates an event that adds a user to a group.
     * @param userPubkey pubkey of the user to add
     * @param groupId group to add the user to
     * @param alt optional description of the event
     * @returns
     */
    static generateAddUserEvent(
        userPubkey: string,
        groupId: string,
        alt?: string
    ) {
        const event = new NDKEvent(undefined, {
            kind: NDKKind.GroupAdminAddUser,
            tags: [
                [ "h", groupId ],
            ]
        } as NostrEvent);

        if (alt) event.alt = alt;

        return event;
    }
}

// Remove a p tag of a user
const untagUser = (pubkey: Hexpubkey) =>
    (tag: NDKTag) =>
        !(tag[0] === "p" && tag[1] === pubkey);