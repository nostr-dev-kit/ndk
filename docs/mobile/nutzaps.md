# Using Nutzaps with NDK Mobile

NDK Mobile provides React hooks for working with NIP-61 nutzaps, making it easy to monitor and process nutzaps in React Native applications.

## Using the useNDKNutzapMonitor Hook

The `useNDKNutzapMonitor` hook provides a simple way to create and manage a nutzap monitor in React applications:

```tsx
import {
    useNDKNutzapMonitor,
    useNDKCurrentUser,
    useNDK,
    NDKKind,
    useNDKWallet,
    useNDKSessionEventKind,
    NDKCashuMintList,
} from "@nostr-dev-kit/ndk-mobile";
import { useState, useEffect } from "react";
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";

// Get the active wallet and current user
const { activeWallet } = useNDKWallet();
const currentUser = useNDKCurrentUser();
const startedRef = useRef(false);
const { nutzapMonitor } = useNDKNutzapMonitor(mintList, false);

useEffect(() => {
    // Make sure we have an activeWallet and a user
    if (!activeWallet || !currentUser) return;

    // Don't start it again
    if (started.current) return;

    nutzapMonitor.wallet = activeWallet;
    nutzapMonitor.start();
}
```
