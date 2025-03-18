# Generate Keys

This snippet demonstrates how to generate a new key pair and obtain all its various formats (private key, public key, nsec, npub).

```typescript
const signer = NDKPrivateKeySigner.generate();
const privateKey = signer.privateKey!;  // Get the hex private key
const publicKey = signer.pubkey;        // Get the hex public key 
const nsec = signer.nsec;               // Get the private key in nsec format
const npub = signer.userSync.npub;          // Get the public key in npub format
```

You can use these different formats for different purposes:
- `privateKey`: Raw private key for cryptographic operations
- `publicKey`: Raw public key (hex format) for verification
- `nsec`: Encoded private key format (bech32) - used for secure sharing when needed
- `npub`: Encoded public key format (bech32) - used for user identification 