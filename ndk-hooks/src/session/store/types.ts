import type NDK from '@nostr-dev-kit/ndk';
import type {
    Hexpubkey,
    NDKEvent,
    NDKKind,
    NDKUser,
    NDKUserProfile,
    NDKSigner,
} from '@nostr-dev-kit/ndk';
import type { NDKEventWithFrom } from '../../common/hooks/subscribe';

/**
 * User-specific session data stored within the main store.
 */
export interface NDKUserSession {
    pubkey: string;
    signer?: NDKSigner;
    mutedPubkeys: Set<string>;
    mutedHashtags: Set<string>;
    mutedWords: Set<string>;
    mutedEventIds: Set<string>;

    profile?: NDKUserProfile;
    followSet?: Set<Hexpubkey>;

    /**
     * Events that are unique per kind, part of the session;
     * we will keep a subscription permanently opened monitoring this
     * event kinds
     */
    replaceableEvents: Map<NDKKind, NDKEvent | null>;

    lastActive: number;
}


/**
 * Session initialization options
 */
export interface SessionInitOptions {
    profile?: boolean;
    follows?: boolean;
    muteList?: boolean;
    events?: Map<NDKKind, { wrap?: NDKEventWithFrom<NDKEvent> }>;
    autoSetActive?: boolean;
}
