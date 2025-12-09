// Import NDK + NIP07 signer
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

// Create a new NDK instance with signer
// provided the signer implements the getRelays() method
const nip07signer = new NDKNip07Signer();

const ndk = new NDK({ signer: nip07signer });
