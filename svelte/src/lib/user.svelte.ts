import type NDK from "@nostr-dev-kit/ndk";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { NDKUser } from "@nostr-dev-kit/ndk";

export interface User {
    get pubkey(): string;
    get npub(): string;
    get profile(): NDKUserProfile | undefined;
    get fetching(): boolean;
    get error(): Error | undefined;
}

/**
 * Resolves a user identifier (npub, NIP-05, hex pubkey, or nprofile) to a reactive user object
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useUser } from '@nostr-dev-kit/svelte';
 *
 *   const user = useUser(ndk, 'npub1...');
 * </script>
 *
 * <div>
 *   <span>{user.npub}</span>
 *   {#if user.profile}
 *     <span>{user.profile.name}</span>
 *   {/if}
 * </div>
 * ```
 */
export function useUser(ndk: NDK, identifier: string): User {
    let _pubkey = $state("");
    let _ndkUser: NDKUser | undefined;
    let _profile = $state<NDKUserProfile | undefined>(undefined);
    let _fetching = $state(false);
    let _error = $state<Error | undefined>(undefined);

    $effect.root(() => {
        $effect(() => {
            if (!identifier) {
                _pubkey = "";
                _ndkUser = undefined;
                _profile = undefined;
                return;
            }

            // npub
            if (identifier.startsWith("npub1")) {
                const user = ndk.getUser({ npub: identifier });
                _ndkUser = user;
                _pubkey = user.pubkey;
                _profile = user.profile;
                fetchProfile(user);
                return;
            }

            // nprofile
            if (identifier.startsWith("nprofile1")) {
                const user = ndk.getUser({ nprofile: identifier });
                _ndkUser = user;
                _pubkey = user.pubkey;
                _profile = user.profile;
                fetchProfile(user);
                return;
            }

            // NIP-05: either user@domain.com or domain.com (shorthand for _@domain.com)
            if (identifier.includes(".")) {
                _fetching = true;
                ndk.getUserFromNip05(identifier)
                    .then((user) => {
                        if (user) {
                            _ndkUser = user;
                            _pubkey = user.pubkey;
                            _profile = user.profile;
                            fetchProfile(user);
                        }
                    })
                    .catch((err) => {
                        _error = err;
                    })
                    .finally(() => {
                        _fetching = false;
                    });
                return;
            }

            // Assume hex pubkey
            _ndkUser = ndk.getUser({ pubkey: identifier });
            _pubkey = identifier;
            _profile = _ndkUser.profile;
            fetchProfile(_ndkUser);
        });
    });

    async function fetchProfile(user: NDKUser) {
        if (user.profile) {
            _profile = user.profile;
            return;
        }

        try {
            _fetching = true;
            await user.fetchProfile();
            _profile = user.profile;
        } catch (err) {
            _error = err as Error;
        } finally {
            _fetching = false;
        }
    }

    return {
        get pubkey() {
            return _pubkey;
        },
        get npub() {
            return _ndkUser?.npub || "";
        },
        get profile() {
            return _profile;
        },
        get fetching() {
            return _fetching;
        },
        get error() {
            return _error;
        },
    };
}
