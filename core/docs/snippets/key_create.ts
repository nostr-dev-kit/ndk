import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Generate a new private key
const signer = NDKPrivateKeySigner.generate();
const privateKey = signer.privateKey; // Get the hex private key
const publicKey = signer.pubkey; // Get the hex public key
const nsec = signer.nsec; // Get the private key in nsec format
const npub = signer.userSync.npub; // Get the public key in npub format
