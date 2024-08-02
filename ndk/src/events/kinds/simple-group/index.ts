import { NDKKind } from "..";
import type { NDKTag, NostrEvent } from "../..";
import { NDKEvent } from "../..";
import type { NDK } from "../../../ndk/index.js";
import type { NDKRelaySet } from "../../../relay/sets/index.js";
import type { NDKSigner } from "../../../signers/index.js";
import type { Hexpubkey, NDKUser } from "../../../user/index.js";
import { NDKSimpleGroupMemberList } from "./member-list.js";
import { NDKSimpleGroupMetadata } from "./metadata.js";

/**
 * Represents a NIP-29 group.
 * @catergory Kind Wrapper
 */
export class NDKSimpleGroup {
    readonly ndk: NDK;
    public groupId: string;
    readonly relaySet: NDKRelaySet;

    private fetchingMetadata: Promise<void> | undefined;

    public metadata: NDKSimpleGroupMetadata | undefined;
    public memberList: NDKSimpleGroupMemberList | undefined;
    public adminList: NDKSimpleGroupMemberList | undefined;

    constructor(ndk: NDK, relaySet: NDKRelaySet, groupId?: string) {
        this.ndk = ndk;
        this.groupId = groupId ?? randomId(24);
        this.relaySet = relaySet;
    }

    get id(): string {
        return this.groupId;
    }

    public relayUrls(): string[] {
        return this.relaySet!.relayUrls;
    }

    get name(): string | undefined {
        return this.metadata?.name;
    }

    get about(): string | undefined {
        return this.metadata?.about;
    }

    get picture(): string | undefined {
        return this.metadata?.picture;
    }

    get members(): Hexpubkey[] | [] {
        return this.memberList?.members ?? [];
    }

    get admins(): Hexpubkey[] | [] {
        return this.adminList?.members ?? [];
    }

    async getMetadata(): Promise<NDKSimpleGroupMetadata> {
        await this.ensureMetadataEvent();
        return this.metadata!;
    }

    /**
     * Creates the group by publishing a kind:9007 event.
     * @param signer
     * @returns
     */
    async createGroup(signer?: NDKSigner) {
        signer ??= this.ndk.signer!;
        if (!signer) throw new Error("No signer available");
        const user = await signer.user();
        if (!user) throw new Error("No user available");

        const event = new NDKEvent(this.ndk);
        event.kind = NDKKind.GroupAdminCreateGroup;
        event.tags.push(["h", this.groupId]);
        await event.sign(signer);
        return event.publish(this.relaySet);
    }

    async setMetadata({
        name,
        about,
        picture,
    }: {
        name?: string;
        about?: string;
        picture?: string;
    }) {
        const event = new NDKEvent(this.ndk);
        event.kind = NDKKind.GroupAdminEditMetadata;
        event.tags.push(["h", this.groupId]);
        if (name) event.tags.push(["name", name]);
        if (about) event.tags.push(["about", about]);
        if (picture) event.tags.push(["picture", picture]);

        await event.sign();
        return event.publish(this.relaySet);
    }

    /**
     * Adds a user to the group using a kind:9000 event
     * @param user user to add
     * @param opts options
     */
    async addUser(user: NDKUser): Promise<NDKEvent> {
        const addUserEvent = NDKSimpleGroup.generateAddUserEvent(user.pubkey, this.groupId);
        addUserEvent.ndk = this.ndk;
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

        if (!memberList) return null;

        return NDKSimpleGroupMemberList.from(memberList);
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

    public async requestToJoin(pubkey: Hexpubkey, content?: string) {
        const event = new NDKEvent(this.ndk, {
            kind: NDKKind.GroupAdminRequestJoin,
            content: content ?? "",
            tags: [["h", this.groupId]],
        } as NostrEvent);
        return event.publish(this.relaySet);
    }

    /**
     * Makes sure that a metadata event exists locally
     */
    async ensureMetadataEvent(): Promise<void> {
        if (this.metadata) return;
        if (this.fetchingMetadata) return this.fetchingMetadata;

        this.fetchingMetadata = this.ndk
            .fetchEvent(
                {
                    kinds: [NDKKind.GroupMetadata],
                    "#d": [this.groupId],
                },
                undefined,
                this.relaySet
            )
            .then((event) => {
                if (event) {
                    this.metadata = NDKSimpleGroupMetadata.from(event);
                } else {
                    this.metadata = new NDKSimpleGroupMetadata(this.ndk);
                    this.metadata.dTag = this.groupId;
                }
            })
            .finally(() => {
                this.fetchingMetadata = undefined;
            })
            .catch(() => {
                throw new Error("Failed to fetch metadata for group " + this.groupId);
            });

        return this.fetchingMetadata;
    }
}

// Remove a p tag of a user
const untagUser = (pubkey: Hexpubkey) => (tag: NDKTag) => !(tag[0] === "p" && tag[1] === pubkey);

function randomId(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charsLength = chars.length;
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}
