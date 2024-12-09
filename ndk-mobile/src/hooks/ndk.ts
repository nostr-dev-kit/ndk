import { useContext } from 'react';
import NDKContext from '../context/ndk';

const useNDK = (): NDKContext => {
    const context = useContext(NDKContext);
    if (context === undefined) {
        throw new Error('useNDK must be used within an NDKProvider');
    }
    return context;
};

export { useNDK };
