import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// From nsec
const signer = new NDKPrivateKeySigner("nsec1...");

// From hex private key
const signer2 = new NDKPrivateKeySigner("hexPrivateKey");
