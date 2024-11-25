import { NDKKind, NDKRelaySet, NDKSimpleGroupMetadata, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
import { NDKSimpleGroupMemberList } from "@nostr-dev-kit/ndk";
import { create } from "zustand";
import { useNDK } from "../../hooks/ndk";

type GroupId = string;
type RelayUrl = string;
type GroupKey = [GroupId, RelayUrl[]];

export interface IGroup {
    id: GroupId;
    relays: RelayUrl[];

    name?: string | null;
    about?: string | null;
    picture?: string | null;

    metadata?: NDKSimpleGroupMetadata | null;
    admins?: NDKSimpleGroupMemberList | null;
    members?: NDKSimpleGroupMemberList | null;

    isMember?: boolean;
    isAdmin?: boolean;
}

type GroupStoreState = {
    /**
     * This is used to find a group entry when all we have is the group id.
     * the key is all the permutations of the group id and relay and the group id on it's own.
     */
    groupKeys: Map<GroupKey | GroupId, GroupKey>;
    groups: Map<GroupKey, IGroup>;
};

type GroupStoreActions = {
    addGroup: (group: IGroup) => void;

    getGroup: (groupId: GroupId, relay?: RelayUrl) => IGroup | undefined;

    fetchRelayGroups: (relay: string) => void;
}

export type GroupStore = GroupStoreState & GroupStoreActions;

const addGroup = (state: GroupStoreState, group: IGroup) => {
    const key: GroupKey = [group.id, group.relays];
    
    state.groups.set(key, group);

    // add all the permutations of the group id and relay to the groupKeys map
    for (const relay of group.relays) {
        const groupKey: GroupKey = [group.id, [relay]];
        state.groupKeys.set(groupKey, key);
    }

    // add the group id on it's own to the groupKeys map
    state.groupKeys.set(group.id, key);

    console.log('adding group', group.id, state.groups.size);

    return state;
}

export function createGroupStore() {    
    const { ndk } = useNDK();
    
    return create<GroupStore>((set, get) => ({
        groupKeys: new Map(),
        groups: new Map(),

        getGroup: (groupId: GroupId, relay?: RelayUrl) => {
            const state = get();
            // go through the groupIds and see if we have one that matches the relay if one was passed, if none was passed, return the first one we find
            if (relay) {
                const groupKey: GroupKey = [groupId, [relay]];
                if (state.groupKeys.has(groupKey)) {
                    const entry = state.groupKeys.get(groupKey)  
                    if (entry) return state.groups.get(entry);
                }
            }

            // get it without the relay
            const groupKey: GroupKey = state.groupKeys.get(groupId);
            if (groupKey) return state.groups.get(groupKey);
        },
        
        addGroup: (group: IGroup) => set((state) => {
            return { ...addGroup(state, group) }
        }),

        updateGroup: (group: IGroup) => set((state) => {
            const key: GroupKey = [group.id, group.relays];
            state.groups.set(key, group);
            return state;
        }),

        fetchRelayGroups: (relay: string) => {
            console.log('calling listRelayGroups', relay);
            const filter = [{ kinds: [NDKKind.GroupMetadata] }];
            const relaySet = NDKRelaySet.fromRelayUrls([relay], ndk);
            console.log('creating subscription');
            const sub = ndk.subscribe(
                filter,
                { groupable: false, closeOnEose: true, cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY },
                relaySet,
                false
            );
        
            sub.on('event', (event) => {
                const metadata = NDKSimpleGroupMetadata.from(event);
                const groupEntry: IGroup = {
                    id: event.id,
                    relays: [event.relay?.url || ""],
        
                    metadata,
                    
                    name: metadata.name,
                    about: metadata.about,
                    picture: metadata.picture,
                };

                set((state) => ({ ...addGroup(state, groupEntry) }));
            });
        
            sub.start();
        
            console.log('starting subscription', filter);
        }
    }));
}