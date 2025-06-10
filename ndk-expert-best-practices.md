# NDK Expert Best Practices (Core/Terminal)

This document outlines best practices for using the core Nostr Development Kit (NDK) library, particularly relevant for terminal-based applications or environments without specific UI frameworks.

## 1. Connection to Relays

*   **Explicit Relays:** Always initialize `NDK` with a set of `explicitRelayUrls`. Relying solely on user relay lists (Kind 3/10002) can be unreliable, especially during initial connection or for fetching those lists themselves.
    ```typescript
    import NDK from "@nostr-dev-kit/ndk";

    const explicitRelays = ["wss://relay.damus.io", "wss://relay.primal.net"];
    const ndk = new NDK({ explicitRelayUrls: explicitRelays });
    ```
*   **Connection Management:** Call `ndk.connect()` early in your application lifecycle. You can optionally pass a timeout. Monitor connection status using the `pool` events if needed.
    ```typescript
    ndk.connect(2000)
        .then(() => console.log("Connected"))
        .catch((e) => console.error("Connection failed", e));

    ndk.pool.on("relay:connect", (relay) => {
        console.log("Connected to relay:", relay.url);
    });
    ndk.pool.on("relay:disconnect", (relay) => {
        console.log("Disconnected from relay:", relay.url);
    });
    ```
*   **Dynamic Relays:** Fetch user-specific relay lists (Kind 10002 or Kind 3) after establishing initial connections and add them to the pool if necessary using `ndk.pool.addRelay()` or by creating `NDKRelaySet`s.

## 2. Signer / Session Management

*   **Signer Initialization:** Instantiate and assign a signer to the `ndk.signer` property as early as possible.
    *   **Private Key (Use with caution):** Suitable for backend services or CLI tools where the key is securely managed.
        ```typescript
        import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

        const pkSigner = new NDKPrivateKeySigner("nsec...");
        const ndk = new NDK({ signer: pkSigner });
        ```
    *   **NIP-07 Signer:** For browser extensions like getalby, nos2x, etc. Check for `window.nostr`.
        ```typescript
        import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

        if (window.nostr) {
            const nip07Signer = new NDKNip07Signer();
            const ndk = new NDK({ signer: nip07Signer });
            nip07Signer.user().then(user => {
                ndk.activeUser = user;
                console.log(`Logged in as ${user.npub}`);
            });
        } else {
            console.error("NIP-07 Signer (browser extension) not found.");
        }
        ```
    *   **NIP-46 Signer (Remote Signer):** For connecting to remote signers like Nostr Connect apps. Requires a secret and potentially a relay for communication.
        ```typescript
        import NDK, { NDKNip46Signer } from "@nostr-dev-kit/ndk";

        const nip46Signer = new NDKNip46Signer(ndk, "npub_of_remote_signer", new NDKPrivateKeySigner("local_app_nsec..."));
        nip46Signer.rpc.relay = ndk.pool.getRelay("wss://relay.nostrconnect.com");
        ndk.signer = nip46Signer;

        nip46Signer.connect().then(() => {
            console.log("Connected to remote signer");
            nip46Signer.user().then(user => {
                ndk.activeUser = user;
                console.log(`Logged in as remote user ${user.npub}`);
            });
        });
        ```
*   **Active User:** Once the signer is ready and the user's pubkey is known, set `ndk.activeUser` for convenience in other parts of the application.
    ```typescript
    const user = await ndk.signer.user();
    ndk.activeUser = user;
    ```

## 3. Cache Adapters

*   **Default (Memory):** NDK uses an in-memory cache by default (`NDKCacheAdapterMemory`). This is suitable for short-lived scripts or environments where persistence isn't needed.
*   **Custom Adapters:** For persistence or more complex caching, implement a custom cache adapter conforming to the `NDKCacheAdapter` interface or use pre-built ones like `ndk-cache-dexie` (browser), `ndk-cache-redis` (server), or `ndk-cache-sqlite-wasm` (browser). Pass the adapter instance during `NDK` initialization.
    ```typescript
    import NDK from "@nostr-dev-kit/ndk";


    ```
*   **Cache Usage:** NDK automatically uses the configured cache for profiles, events, and relay sets. Be mindful of cache invalidation if needed, although NDK handles replacing events based on NIP-01 rules (newer `created_at`).

## 4. Fetching Data via Subscriptions

*   **Use `fetchEvents`:** This is the primary method for fetching events. It returns a promise resolving to a set of `NDKEvent` objects.
    ```typescript
    const filter: NDKFilter = { kinds: [1], authors: ["pubkey..."], limit: 10 };
    const events: Set<NDKEvent> = await ndk.fetchEvents(filter);
    events.forEach(event => console.log(event.content));
    ```
*   **Use `subscribeEvents` for Real-time Updates:** For continuous updates, use `subscribeEvents`. It returns an `NDKSubscription` object. Remember to call `sub.stop()` when done.
    ```typescript
    const filter: NDKFilter = { kinds: [1], authors: ["pubkey..."], "#t": ["ndk"] };
    const sub = ndk.subscribeEvents(filter, { closeOnEose: false });

    sub.on("event", (event: NDKEvent) => {
        console.log("Received real-time event:", event.content);
    });

    sub.on("eose", () => {
        console.log("Initial events loaded, waiting for new ones...");
    });

    sub.start();


    ```
*   **Subscription Options:** Utilize `NDKSubscriptionOptions` for fine-grained control:
    *   `closeOnEose`: Set to `false` for continuous subscriptions (default is `true`).
    *   `groupable`: Set to `false` if you need immediate events instead of waiting for the `groupableDelay` (default is `true`).
    *   `groupableDelay`: Time in ms to wait before emitting grouped events (default 100ms).
    *   `cacheUsage`: Control how the cache is used (`CacheOnly`, `RelayOnly`, `Both`, `PARALLEL`). `PARALLEL` often provides the best UX.
*   **Filter Specificity:** Use specific filters (kinds, authors, tags, ids) to minimize the data requested from relays. Avoid overly broad filters.
*   **Fetching Single Events:** Use `fetchEvent` (singular) for fetching a single event by ID or filter, often useful for fetching profiles or specific referenced events.

## 5. Fetching Profile Information

*   **Use `ndk.getUser()`:** Get an `NDKUser` object. This doesn't automatically fetch the profile.
    ```typescript
    const user: NDKUser = ndk.getUser({ pubkey: "pubkey..." });
    ```
*   **Fetch Profile:** Call `user.fetchProfile()` to retrieve the kind 0 event. NDK handles caching.
    ```typescript
    const profile = await user.fetchProfile();
    if (profile) {
        console.log(`User name: ${profile.name}`);
        console.log(`User bio: ${profile.about}`);
    }
    ```
*   **Access Profile Data:** Access profile fields directly from the `user.profile` object after fetching.
    ```typescript
    if (user.profile) {
        console.log(user.profile.nip05);
    }
    ```

## 6. Publishing Events

*   **Create `NDKEvent`:** Instantiate `NDKEvent` and set its properties (`kind`, `content`, `tags`).
    ```typescript
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = "Hello from NDK!";
    event.tags = [["t", "ndk-test"]];
    ```
*   **Sign:** Ensure `ndk.signer` is set. Signing happens automatically before publishing via `event.sign()`. For replaceable/parameterized replaceable events, call `sign()` explicitly if you need the ID before publishing, otherwise `publish()` handles it.
*   **Publish:** Call `event.publish()`. This method is **optimistic** by default. It returns a promise that resolves with the set of relays the event was *sent* to, but doesn't guarantee successful writing or propagation.
    ```typescript
    try {
        const publishedToRelays = await event.publish();
        console.log(`Event ${event.id} published to ${publishedToRelays.size} relays`);

    } catch (error) {
        console.error("Failed to publish event:", error);

    }
    ```
*   **Replaceable Events:** Use `publishReplaceable()` for kinds 0, 3, 10000-19999, and 30000-39999.
    ```typescript
    const profileEvent = new NDKEvent(ndk);
    profileEvent.kind = 0;
    profileEvent.content = JSON.stringify({ name: "New Name" });
    await profileEvent.publishReplaceable();
    ```
*   **Parameterized Replaceable Events:** Set the `d` tag and use `publishReplaceable()`.
    ```typescript
    const articleEvent = new NDKEvent(ndk);
    articleEvent.kind = 30023;
    articleEvent.content = "My article content...";
    articleEvent.tags = [["d", "my-article-identifier"], ["title", "My Article"]];
    await articleEvent.publishReplaceable();
    ```
*   **Targeted Relays:** Publish to a specific set of relays using an `NDKRelaySet`.
    ```typescript
    const specificRelaySet = NDKRelaySet.fromRelayUrls(["wss://relay.example.com"], ndk);
    await event.publish(specificRelaySet);
    ```

## 7. Event-Kind Wrapping

*   **Prefer Kind Wrappers:** Use the specific classes provided in `ndk-core/src/events/kinds/*` (e.g., `NDKArticle`, `NDKNote`, `NDKUserProfile`, `NDKHighlight`, `NDKRelayList`) instead of manipulating raw `NDKEvent` tags and content whenever possible.
*   **Instantiation:** Create wrappers directly or use the static `from(event)` method.
    ```typescript
    import { NDKArticle, NDKEvent } from "@nostr-dev-kit/ndk";


    const article = new NDKArticle(ndk);
    article.title = "My New Article";
    article.content = "Article body...";
    article.publishReplaceable();


    const rawEvent: NDKEvent = await ndk.fetchEvent("note1...");
    if (rawEvent?.kind === NDKKind.Article) {
        const wrappedArticle = NDKArticle.from(rawEvent);
        console.log(wrappedArticle.title);
    }
    ```
*   **Convenience Methods:** Utilize the getters and setters provided by the wrappers (e.g., `article.title`, `relayList.readRelayUrls`).

## 8. Zapping

*   **Instantiate `NDKZapper`:** Create an instance with the target (user or event), amount (in msat), and optional configuration.
    ```typescript
    import { NDKZapper, NDKUser } from "@nostr-dev-kit/ndk";

    const targetUser = ndk.getUser({ pubkey: "target_pubkey..." });
    const amountMsat = 21000;
    const zapper = new NDKZapper(targetUser, amountMsat, "msat", { ndk, signer: ndk.signer, comment: "Great post!" });
    ```
*   **Provide Payment Callbacks:** You MUST provide `lnPay` and/or `cashuPay` callbacks in the `NDKZapper` options or globally in `ndk.walletConfig`. These functions handle the actual payment logic (fetching invoice, paying, providing proofs).
    ```typescript

    zapper.lnPay = async (paymentInfo) => {
        console.log(`Need to pay LN invoice: ${paymentInfo.pr}`);



        return undefined;
    };
    ```
*   **Initiate Zap:** Call `zapper.zap()`. This handles fetching recipient zap info (LUD-06/16, NIP-61), generating zap requests (NIP-57), calling your payment callbacks, and publishing nutzaps (NIP-61).
    ```typescript
    try {
        const results = await zapper.zap();
        console.log("Zap results:", results);
        results.forEach((result, split) => {
            if (result instanceof Error) {
                console.error(`Zap failed for ${split.pubkey}: ${result.message}`);
            } else {
                console.log(`Zap successful for ${split.pubkey}:`, result);
            }
        });
    } catch (error) {
        console.error("Zap process failed:", error);
    }
    ```
*   **Event Handling:** Listen to events emitted by the `NDKZapper` instance (`ln_invoice`, `ln_payment`, `split:complete`, `complete`, `notice`) for detailed progress updates.
*   **Splits:** Be aware that `NDKZapper` automatically handles zap splits defined in the target event's `zap` tags. Your payment callbacks will be called for each split recipient.

## 9. Wallet Operations (`ndk-wallet`)

*   **Core NDK doesn't include wallet UI/logic.** The `ndk-wallet` package provides implementations for common wallet interactions (NWC, WebLN, Cashu).
*   **Integration:** In a core/terminal context, you would typically integrate `ndk-wallet` components to provide the necessary `lnPay` or `cashuPay` callbacks to `NDKZapper`.
    *   **NWC:** Instantiate `NDKNwcWallet` with connection details, connect, and use its `payInvoice` method within your `lnPay` callback.
    *   **Cashu:** Instantiate `NDKCashuWallet` (requires a mint interface), load state, and use its methods (`payLnInvoice`, `send`) within your `cashuPay` or `lnPay` callbacks.
*   **Configuration:** Set up `ndk.walletConfig` globally or pass callbacks directly to `NDKZapper`.
    ```typescript





    ```

Remember to handle errors gracefully throughout your application, especially during network operations like connecting, fetching, and publishing.

* How to generate a new private key:
const signer = NDKPrivateKey.generate();
const { npub, nsec, pubkey } = signer;
console.log("Generated a new nsec and npub", { npub, nsec });

* Converting from/to npub/pubkey:
const pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
const user = new NDKUser({ pubkey });
const npub = user.npub; // we started with a pubkey and now we have the npub of that user.

// the reverse also works:
const user = new NDKUser({ npub });
console.log(`npub ${npub} is pubkey ${user.pubkey}`);

