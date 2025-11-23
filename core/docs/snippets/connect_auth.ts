import NDK, { NDKRelayAuthPolicies } from "@nostr-dev-kit/ndk";

const ndk = new NDK();
ndk.addExplicitRelay("wss://relay.f7z.io", NDKRelayAuthPolicies.signIn({ ndk }));
