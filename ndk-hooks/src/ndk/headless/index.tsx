import NDK, { type NDKConstructorParams } from "@nostr-dev-kit/ndk";
import { useEffect } from "react";
import { useNDKSessionMonitor } from "../../session/hooks/use-ndk-session-monitor";
import type { NDKSessionStorageAdapter } from "../../session/storage";
import type { SessionStartOptions } from "../../session/store/types";
import { useNDK, useNDKInit } from "../hooks";

interface NDKHeadlessProps {
    ndk: NDKConstructorParams;
    session?:
        | {
              storage: NDKSessionStorageAdapter;
              opts: SessionStartOptions;
          }
        | false;
}

/**
 * Add a headless component to make it simpler to instantiate NDK in React apps.
 *
 * @example
 * ```tsx
 * import { NDKHeadless } from "@nostr-dev-kit/ndk-hooks";
 *
 * function App() {
 *   return (
 *     <>
 *     <NDKHeadless
 *       ndk={{ explicitRelayUrls: ["wss://relay.damus.io"] }}
 *      session={{ storage: new NDKSessionLocalStorage(), opts: { follows: true, profile: true } }}
 *     />
 *     <YourApp />
 *    </>
 *  );
 * }
 */
export function NDKHeadless({ ndk, session = false }: NDKHeadlessProps) {
    const initNDK = useNDKInit();
    const { ndk: ndkInstance } = useNDK();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const ndkInstance = new NDK(ndk);

        // if it has an initialization function, call it and await it
        console.log("Initializing NDK with options:");
        if (typeof ndkInstance.cacheAdapter?.initializeAsync === "function") {
            console.log("Using async cache adapter initialization");
            ndkInstance.cacheAdapter
                .initializeAsync(ndkInstance)
                .then(() => {
                    console.log("NDK cache adapter initialized successfully");
                })
                .catch((error) => {
                    console.error("Failed to initialize NDK cache adapter:", error);
                })
                .finally(() => {
                    console.log("Calling initNDK");
                    initNDK(ndkInstance);
                });
        } else {
            console.log("Using sync cache adapter initialization");
            ndkInstance.cacheAdapter?.initialize?.(ndkInstance);
            console.log("NDK cache adapter initialized successfully");
            initNDK(ndkInstance);
        }
    }, []);

    useEffect(() => {
        ndkInstance?.connect();
    }, [ndkInstance]);

    useNDKSessionMonitor(session ? session.storage : false, session ? session.opts : undefined);

    return null;
}
