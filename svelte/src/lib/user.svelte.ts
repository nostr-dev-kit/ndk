import { NDKUser, type NDKZapMethod, type NDKZapMethodInfo } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";
import { validateCallback } from "./utils/validate-callback.js";
import { untrack } from "svelte";

// Track in-flight user fetch requests to prevent duplicate fetches
const inFlightUserRequests = new Map<string, Promise<NDKUser | null>>();

export type FetchUserResult = NDKUser & {
    $loaded: boolean;
};

/**
 * Reactively fetch a user by identifier
 *
 * Returns a reactive user object with all user properties directly accessible.
 * Use `$loaded` to check if the user has been fetched.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const user = ndk.$fetchUser(() => identifier);
 * </script>
 *
 * {#if user.$loaded}
 *   <div>{user.npub}</div>
 * {:else}
 *   <div>Loading...</div>
 * {/if}
 * ```
 */
export function createFetchUser(ndk: NDKSvelte, identifier: () => string | undefined): FetchUserResult {
    validateCallback(identifier, "$fetchUser", "identifier");

    // Initialize as class instance to preserve prototype/getters/methods
    const instance = new NDKUser({});
    (instance as any).$loaded = false; // Add dynamic $loaded property
    const res = $state(instance as FetchUserResult);

    const derivedIdentifier = $derived(identifier());

    function clearRes() {
        // Mutate to clear all properties except $loaded, then set $loaded
        Object.keys(res).forEach((key) => {
            if (key !== "$loaded") delete res[key as keyof FetchUserResult];
        });
        res.$loaded = false;
    }

    $effect(() => {
        const id = derivedIdentifier;

        if (!id) {
            untrack(() => clearRes());
            return;
        }

        // Check if there's already an in-flight request for this identifier
        let fetchPromise = inFlightUserRequests.get(id);

        if (!fetchPromise) {
            // No in-flight request, create a new one
            fetchPromise = ndk.fetchUser(id).then(user => user ?? null).finally(() => {
                inFlightUserRequests.delete(id);
            });

            inFlightUserRequests.set(id, fetchPromise);
        }

        // Clear user while loading
        untrack(() => clearRes());

        // Capture id in closure for async callbacks
        const capturedId = id;

        fetchPromise
            .then((fetchedUser) => {
                if (fetchedUser && derivedIdentifier === capturedId) {
                    // Assign all user properties directly to res
                    Object.assign(res, fetchedUser);
                    res.$loaded = true;
                }
            })
            .catch(() => {
                if (derivedIdentifier === capturedId) {
                    clearRes();
                }
            });
    });

    return res;
}

export type ZapInfo = {
    methods: Map<NDKZapMethod, NDKZapMethodInfo>;
    isLoading: boolean;
    error?: string;
};

/**
 * Reactively fetch zap information for a user
 *
 * Returns reactive zap method information (NIP-57 lud06/lud16, NIP-61 mint list)
 * that updates when the user changes.
 *
 * @param user - Reactive function that returns the user to fetch zap info for
 * @param timeoutMs - Optional timeout for fetching zap info (default: 2500ms)
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const user = ndk.$fetchUser(() => npub);
 *   const zapInfo = createZapInfo(() => user);
 * </script>
 *
 * {#if zapInfo.isLoading}
 *   Loading...
 * {:else if zapInfo.methods.has('nip57')}
 *   {@const nip57Info = zapInfo.methods.get('nip57')}
 *   <div>LN: {nip57Info.lud16 || nip57Info.lud06}</div>
 * {/if}
 * ```
 */
export function createZapInfo(user: () => NDKUser | undefined, timeoutMs: number = 2500): ZapInfo {
    validateCallback(user, 'createZapInfo', 'user');
    let methods = $state<Map<NDKZapMethod, NDKZapMethodInfo>>(new Map());
    let isLoading = $state(false);
    let error = $state<string | undefined>(undefined);

    const derivedUser = $derived(user());

    $effect(() => {
        const currentUser = derivedUser;

        if (!currentUser) {
            methods = new Map();
            isLoading = false;
            error = undefined;
            return;
        }

        isLoading = true;
        error = undefined;

        currentUser
            .getZapInfo(timeoutMs)
            .then((zapMethods) => {
                methods = zapMethods;
                isLoading = false;
            })
            .catch((e) => {
                error = e.message || "Failed to fetch zap info";
                methods = new Map();
                isLoading = false;
            });
    });

    return {
        get methods() {
            return methods;
        },
        get isLoading() {
            return isLoading;
        },
        get error() {
            return error;
        },
    };
}
