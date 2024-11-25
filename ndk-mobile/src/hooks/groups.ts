import { useContext } from 'react';
import NDKGroupsContext from '../context/groups';

const useGroups = (): NDKGroupsContext => {
    const context = useContext(NDKGroupsContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within an NDKGroupsProvider');
    }
    return context;
};

export { useGroups };