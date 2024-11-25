import { createContext } from 'react';
import { GroupStore } from '../providers/groups/store';
import { StoreApi } from 'zustand';

interface NDKGroupsContext {
    store: StoreApi<GroupStore> | null
}

const NDKGroupsContext = createContext<NDKGroupsContext>({
    store: null
});

export default NDKGroupsContext;
