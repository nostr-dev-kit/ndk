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
    const [user, setUser] = useState();

    useEffect(() => {
        if (!input || !ndk) {
            setUser(undefined);
            return;
        }

        const processInput = async () => {
            try {
                // Check if it's a hex pubkey (64 chars of hex)
                if (/^[0-9a-fA-F]{64}$/.test(input)) {
                    setUser(ndk.getUser({ pubkey: input }));
                }
                // Check if it's an npub
                else if (input.startsWith("npub1")) {
                    setUser(ndk.getUser({ npub: input }));
                }
                // Check if it's an nprofile
                else if (input.startsWith("nprofile1")) {
                    setUser(ndk.getUser({ nprofile: input }));
                }
                // Assume it's a nip05
                else if (input.includes("@") || input.includes(".")) {
                    const user = await ndk.getUserFromNip05(input);
                    setUser(user || undefined);
                } else {
                    setUser(undefined);
                }
            } catch (e) {
                setUser(undefined);
            }
        };

        processInput();
    }, [input, ndk]);

    return user;
}
