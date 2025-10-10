import type { NDKUser } from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "react";
import { useNDK } from "../../ndk/hooks";

/**
 * Hook to get an NDKUser instance from various input formats.
 * Accepts pubkey (hex), npub, nip05, or nprofile and resolves to an NDKUser.
 *
 * @param input - The user identifier (pubkey, npub, nip05, or nprofile)
 * @returns An NDKUser instance or undefined
 *
 * @example
 * ```ts
 * // Using hex pubkey
 * const user = useUser("abc123...");
 *
 * // Using npub
 * const user = useUser("npub1...");
 *
 * // Using nip05
 * const user = useUser("alice@example.com");
 *
 * // Using nprofile
 * const user = useUser("nprofile1...");
 * ```
 */
export function useUser(input?: string): NDKUser | undefined {
    const { ndk } = useNDK();
    const [user, setUser] = useState(undefined as NDKUser | undefined);

    useEffect(() => {
        if (!input || !ndk) {
            setUser(undefined);
            return;
        }

        const processInput = async () => {
            try {
                // fetchUser handles all formats: hex, npub, nprofile, and NIP-05
                const user = await ndk.fetchUser(input);
                setUser(user || undefined);
            } catch (e) {
                setUser(undefined);
            }
        };

        processInput();
    }, [input, ndk]);

    return user;
}
