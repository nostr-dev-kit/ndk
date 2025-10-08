# Generate Keys

This snippet demonstrates how to generate a new key pair and obtain all its various formats (private key, public key, nsec, npub).

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const signer = NDKPrivateKeySigner.generate();
const privateKey = signer.privateKey!; // Get the hex private key
const publicKey = signer.pubkey; // Get the hex public key
const nsec = signer.nsec; // Get the private key in nsec format
const npub = signer.userSync.npub; // Get the public key in npub format
```

You can use these different formats for different purposes:

- `privateKey`: Raw private key for cryptographic operations
- `publicKey`: Raw public key (hex format) for verification
- `nsec`: Encoded private key format (bech32) - used for secure sharing when needed
- `npub`: Encoded public key format (bech32) - used for user identification

## Secure Storage with Password Protection

For storing keys securely with password protection, use NIP-49 (ncryptsec format):

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const signer = NDKPrivateKeySigner.generate();

// Encrypt with a password
const password = "user-chosen-password";
const ncryptsec = signer.encryptToNcryptsec(password);

// Store securely (e.g., localStorage)
localStorage.setItem("encrypted_key", ncryptsec);

// Later, restore the signer
const restoredSigner = NDKPrivateKeySigner.fromNcryptsec(
    localStorage.getItem("encrypted_key"),
    password,
);
```

See [Encrypted Keys (NIP-49)](./encrypted-keys-nip49.md) for more examples and best practices.
