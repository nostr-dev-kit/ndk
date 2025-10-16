# Relay Authentication

NIP-42 defines that relays can request authentication from clients.

NDK makes working with NIP-42 very simple. NDK uses an `NDKAuthPolicy` callback to provide a way to handle
authentication requests.

* Relays can have specific `NDKAuthPolicy` functions.
* NDK can be configured with a default `relayAuthDefaultPolicy` function.
* NDK provides some generic policies:
    * `NDKAuthPolicies.signIn`: Authenticate to the relay (using the `ndk.signer` signer).
    * `NDKAuthPolicies.disconnect`: Immediately disconnect from the relay if asked to authenticate.

```ts
import { NDK, NDKRelayAuthPolicies } from "@nostr-dev-kit/ndk";

const ndk = new NDK();
ndk.addExplicitRelay("wss://relay.f7z.io", NDKRelayAuthPolicies.signIn({ndk}));
```

Clients should typically allow their users to choose where to authenticate. This can be accomplished by returning the
decision the user made from the `NDKAuthPolicy` function.

```ts
import { NDK, NDKRelayAuthPolicies } from "@nostr-dev-kit/ndk";

const ndk = new NDK();
ndk.relayAuthDefaultPolicy = (relay: NDKRelay) => {
    return confirm(`Authenticate to ${relay.url}?`);
};
```
