import { useContext } from 'react';
import NDKSessionContext from '../context/session';

const useNDKSession = (): NDKSessionContext => {
    const context = useContext(NDKSessionContext);
    if (context === undefined) {
        throw new Error('useNDK must be used within an NDKProvider');
    }
    return context;
};

export { useNDKSession };
