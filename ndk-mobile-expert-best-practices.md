# NDK Mobile Expert Best Practices (Expo / ndk-mobile)

This document outlines best practices for using NDK within Expo (React Native) applications, leveraging `ndk-hooks` for reactivity and `ndk-mobile` for mobile-specific utilities like session persistence. Familiarity with core NDK and `ndk-hooks` concepts is assumed.

## 1. NDK Instance Management (`useNdk` / Provider)

*   **Centralized Instance:** Similar to web development, create a single `NDK` instance and provide it application-wide using standard React Context. `ndk-hooks` relies on this context.
*   **Initialization & Context Setup:** Initialize NDK early (e.g., `App.tsx`). Create a React Context and provide the NDK instance.
    ```typescript
    // Example: React Context Setup for Expo/React Native
    import React, { createContext, useContext } from 'react';
    import NDK from "@nostr-dev-kit/ndk";
    // Import your chosen cache adapter if using one

    // 1. Create Context
    const NDKContext = createContext<NDK | undefined>(undefined);

    // 2. Initialize NDK
    const explicitRelays = ["wss://relay.damus.io", "wss://relay.primal.net"];
    // const cacheAdapter = new YourMobileCacheAdapter(...);
    const ndkInstance = new NDK({
        explicitRelayUrls: explicitRelays,
        // cacheAdapter: cacheAdapter,
    });

    ndkInstance.connect().catch((e) => console.error("NDK Connection failed", e));

    // 3. Create Provider Component
    export const NDKProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
            <NDKContext.Provider value={ndkInstance}>
                {children}
            </NDKContext.Provider>
        );
    };

    // 4. Custom Hook for easy access (optional but recommended)
    export const useMyNDK = () => {
        const context = useContext(NDKContext);
        if (context === undefined) {
            throw new Error('useMyNDK must be used within an NDKProviderComponent');
        }
        return context;
    };

    // 5. Wrap your app in App.tsx
    export default function App() {
        return (
            <NDKProviderComponent>
                {/* Your Navigation Container and Screens */}
            </NDKProviderComponent>
        );
    }
    ```
*   **Accessing NDK:** Use the `useNdk()` hook from `ndk-hooks` (which internally uses `useContext`) or your custom hook (`useMyNDK` in the example) within your components.

## 2. Signer / Session Management (`useSession`, `ndk-mobile`)

*   **Reactive State:** Use `useSession()` from `ndk-hooks` to reactively track the active user and signer status in your UI components.
*   **Signer Options:**
    *   **NIP-46 (Nostr Connect):** Often the best UX for mobile. Instantiate `NDKNip46Signer`, manage the connection flow (e.g., QR code scanning, deep-linking), and assign the signer to `ndk.signer`.
    *   **Private Key (High Risk):** Storing private keys directly on mobile devices is generally discouraged due to security risks. If absolutely necessary (e.g., for specific non-custodial scenarios), use secure storage mechanisms like Expo's `SecureStore` and load the `NDKPrivateKeySigner` carefully. **Never hardcode private keys.**
    *   **NIP-07:** Not applicable in standard React Native environments.
*   **Session Persistence (`ndk-mobile/session-storage-adapter`):**
    *   `ndk-mobile` provides utilities to help persist session information (like NIP-46 connection details) across app launches.
    *   Integrate the `session-storage-adapter` (likely using `AsyncStorage` or `SecureStore` behind the scenes) with your NDK setup or session management logic to automatically load/save signer details. Refer to `ndk-mobile` documentation for specific usage. This avoids requiring the user to reconnect (e.g., scan QR) every time the app starts.
    ```typescript





    ```

## 3. Cache Adapters (Mobile Persistence)

*   **Importance:** A persistent cache is crucial for good performance and offline capabilities on mobile.
*   **Options:**
    *   **`ndk-cache-sqlite-wasm`:** Can be used if Expo's WASM support is configured correctly for your build process. Offers good performance. Requires careful setup of WASM file serving/bundling.
    *   **Native SQLite:** Consider using Expo's `expo-sqlite` module. You might need to create a custom `NDKCacheAdapter` implementation that bridges NDK's caching needs with `expo-sqlite`'s API. This often provides the best native performance.
    *   **`AsyncStorage`:** Can be used via a custom adapter for very simple caching needs, but performance will degrade significantly with larger amounts of data compared to SQLite. Not generally recommended for full event/profile caching.
*   **Initialization:** Pass the chosen cache adapter instance during `NDK` initialization.

## 4. Fetching Data (`useEvents`, `useProfile`, etc.)

*   **Use Hooks:** Rely heavily on `useEvents`, `useProfile`, and `useEvent` from `ndk-hooks` for declarative data fetching and automatic UI updates in your React Native components. This simplifies state management significantly.
    ```typescript
    import { useEvents } from "@nostr-dev-kit/ndk-hooks";
    import { NDKKind } from "@nostr-dev-kit/ndk";
    import { View, Text, FlatList } from "react-native";

    function UserNotes({ pubkey }: { pubkey: string }) {
        const filter = { kinds: [NDKKind.Text], authors: [pubkey], limit: 50 };

        const { events } = useEvents(filter, { cacheUsage: NDKSubscriptionCacheUsage.PARALLEL });

        return (
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
                        <Text>{item.content}</Text>
                    </View>
                )}
            />
        );
    }
    ```
*   **Options:** Utilize `NDKSubscriptionOptions` (e.g., `cacheUsage: NDKSubscriptionCacheUsage.PARALLEL`) and the `disable` option within hooks as needed.

## 5. Publishing Events

*   **Optimistic Approach:** Use `event.publish()` or `event.publishReplaceable()`. Update the UI optimistically based on the assumption of success.
*   **Error Handling:** Catch errors from `publish()` (e.g., signer issues, no connected relays) and provide user feedback.
*   **Background Sync (Advanced):** For robustness against network issues, consider implementing a queue for unpublished events (potentially using the cache adapter's unpublished event features if available, like in `ndk-cache-sqlite-wasm`) and attempting to publish them later or in a background process (if using Expo Application Services - EAS).

## 6. Event-Kind Wrapping

*   **Consistent Practice:** Continue using kind wrappers (`NDKArticle`, `NDKUserProfile`, etc.) for creating and interpreting specialized events. Wrap events received from hooks (`useEvents`) using `WrapperClass.from(event)` when accessing kind-specific properties.

## 7. Zapping

*   **`NDKZapper`:** Use the core `NDKZapper` class.
*   **Wallet Integration (`ndk-wallet`):**
    *   **NWC:** This is often the most practical approach on mobile. Use `NDKNwcWallet` from `ndk-wallet`. Store the NWC connection URI securely (e.g., `SecureStore`) potentially managed via the `ndk-mobile` session adapter. Provide `nwcWallet.payInvoice` as the `lnPay` callback.
    *   **Cashu (`NDKCashuWallet`):** Feasible if you handle mint interactions within the app. Requires secure storage for wallet state/proofs (`SecureStore` recommended). Provide `cashuWallet.payLnInvoice` or `cashuWallet.send` logic within the `cashuPay` callback.
    *   **Deep Linking:** Explore deep-linking to external mobile wallets (Alby, BlueWallet, etc.) if `ndk-wallet` or another library provides helpers for constructing the correct invoice URLs (e.g., `lightning:`, `nostr:nevent...` with zap details). This requires the user to have a compatible wallet installed.
*   **UI Feedback:** Use `NDKZapper` events to show progress (fetching invoice, waiting for payment, confirmation).

## 8. `ndk-mobile` Specific Hooks (e.g., NIP-55)

*   **`useZapReceipts` (Hypothetical based on `nip55.tsx`):** `ndk-mobile` might offer hooks like `useZapReceipts(zapRequestEventId)` or similar (check actual `ndk-mobile` API). This hook would subscribe to NIP-55 zap receipt events (kind 7003) related to a specific zap, allowing you to confirm successful zaps directly within the UI without relying solely on wallet callbacks.
    ```typescript




    ```

## 9. Performance & Offline Considerations

*   **Caching:** Aggressively use a persistent cache (`ndk-cache-sqlite-wasm` or native). Use `PARALLEL` cache strategy.
*   **Network Awareness:** Be mindful of data usage on cellular networks. Potentially adjust subscription limits or fetching strategies based on network status (using `expo-network`).
*   **Minimize Fetches:** Use specific filters. Fetch profiles/events only when needed.
*   **UI Performance:** Use `FlatList` or virtualized lists for long feeds. Avoid complex computations during rendering. Use `React.memo` or equivalent for components that receive event objects as props.
*   **Image/Media Handling:** Use optimized image loading components (like `expo-image`) and consider caching media assets locally.

Building for mobile requires careful attention to persistence, network usage, and security (especially around private keys). `ndk-hooks` provides the reactive foundation, while `ndk-mobile` adds crucial utilities for session persistence and potentially other mobile-centric features.