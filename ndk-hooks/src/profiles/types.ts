import type { NDKSubscriptionOptions } from "@nostr-dev-kit/ndk";

/**
 * Options for useProfileValue and fetchProfile
 */
export interface UseProfileValueOptions {
    /** Whether to force a refresh of the profile */
    refresh?: boolean;
    /** Subscription options to use when fetching the profile */
    subOpts?: NDKSubscriptionOptions;
}
