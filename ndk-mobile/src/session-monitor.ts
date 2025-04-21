import type { SessionStartOptions } from "@nostr-dev-kit/ndk-hooks";
import { useNDKSessionMonitor } from "@nostr-dev-kit/ndk-hooks";
import { useEffect, useRef, useState } from "react";
import { NDKSessionExpoSecureStore, migrateLegacyLogin } from "./session-storage-adapter.js";

/**
 * Hook to monitor NDK session state and persist changes to secure storage.
 * It also loads persisted sessions on initial mount and handles legacy login migration.
 *
 * This is a wrapper around the useNDKSessionMonitor hook from ndk-hooks,
 * providing a SecureStore-based storage adapter and handling mobile-specific migration.
 *
 * @param opts Optional session monitor options
 * @returns null
 */
export function useSessionMonitor(opts?: SessionStartOptions) {
    const [isMigrated, setIsMigrated] = useState(false);
    const secureStoreAdapter = useRef(new NDKSessionExpoSecureStore());

    // Handle legacy login migration
    useEffect(() => {
        if (!isMigrated) {
            migrateLegacyLogin(secureStoreAdapter.current).then(() => {
                setIsMigrated(true);
            });
        }
    }, [isMigrated]);

    // Use the core session monitor hook with our SecureStore adapter
    useNDKSessionMonitor(isMigrated ? secureStoreAdapter.current : false, opts);

    return null;
}
