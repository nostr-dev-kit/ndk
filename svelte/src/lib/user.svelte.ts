import type { NDKUser, NDKZapMethod, NDKZapMethodInfo } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "./ndk-svelte.svelte";

/**
 * Reactively fetch a user by identifier
 *
 * Returns a reactive proxy to the user that updates when the identifier changes.
 * Use it directly as if it were an NDKUser - all property access is reactive.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const identifier = $derived($page.params.id);
 *   const user = ndk.$fetchUser(() => identifier);
 * </script>
 *
 * {#if user}
 *   <div>{user.npub}</div>
 * {/if}
 * ```
 */
export function createFetchUser(ndk: NDKSvelte, identifier: () => string | undefined) {
    let _user = $state<NDKUser | undefined>(undefined);

    const derivedIdentifier = $derived(identifier());

    $effect(() => {
        const id = derivedIdentifier;
        if (!id) {
            _user = undefined;
            return;
        }

        ndk.fetchUser(id)
            .then((fetchedUser) => {
                _user = fetchedUser || undefined;
            })
            .catch(() => {
                _user = undefined;
            });
    });

    // Return a proxy that forwards all access to the reactive _user
    return new Proxy({} as NDKUser | undefined, {
        get(_target, prop) {
            if (_user && prop in _user) {
                const value = _user[prop as keyof NDKUser];
                return typeof value === "function" ? value.bind(_user) : value;
            }
            return undefined;
        },
        has(_target, prop) {
            return _user ? prop in _user : false;
        },
        ownKeys() {
            return _user ? Reflect.ownKeys(_user) : [];
        },
        getOwnPropertyDescriptor(_target, prop) {
            return _user ? Reflect.getOwnPropertyDescriptor(_user, prop) : undefined;
        },
    });
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
 *   const zapInfo = useZapInfo(() => user);
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
export function useZapInfo(user: () => NDKUser | undefined, timeoutMs: number = 2500): ZapInfo {
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
