import type { NDKEvent, NDKKind, Hexpubkey } from '@nostr-dev-kit/ndk';

/**
 * Interface representing a user session
 */
export interface NDKUserSession {
    /**
     * The pubkey associated with this session
     */
    pubkey: Hexpubkey;
    
    /**
     * Set of followed pubkeys
     */
    followSet?: Set<string>;
    
    /**
     * Set of muted pubkeys
     */
    mutedPubkeys?: Set<string>;
    
    /**
     * Set of muted hashtags
     */
    mutedHashtags?: Set<string>;
    
    /**
     * Set of muted words
     */
    mutedWords?: Set<string>;
    
    /**
     * Set of muted event IDs
     */
    mutedEventIds?: Set<string>;
    
    /**
     * Map of events keyed by kind
     */
    events?: Map<NDKKind, NDKEvent>;
    
    /**
     * Active subscriptions for this session
     */
    subscriptions?: Set<string>;
    
    /**
     * Last active timestamp
     */
    lastActive?: number;
}