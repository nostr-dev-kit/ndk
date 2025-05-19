import NDK, { NDKConstructorParams } from "@nostr-dev-kit/ndk";
import { NDKSessionStorageAdapter } from "../../session/storage";
import { useNDKInit } from "../hooks";
import { useEffect } from "react";
import { useNDKSessionMonitor } from "../../session/hooks/use-ndk-session-monitor";
import { SessionStartOptions } from "../../session/store/types";

interface NDKHeadlessProps {
    ndk: NDKConstructorParams;
    session:
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

    useEffect(() => {
        const _ndk = new NDK(ndk);
        initNDK(_ndk);
    }, []);

    useNDKSessionMonitor(session ? session.storage : false, session ? session.opts : undefined);

    return null;
}
