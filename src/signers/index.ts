import NDKUser from '../user';
import type {NostrEvent} from '../events/';

export interface NDKSigner {
    user: NDKUser | undefined;
    sign(event: NostrEvent): Promise<string>;
}

