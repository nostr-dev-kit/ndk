# Encrypted Keys (NIP-49)

This snippet demonstrates how to encrypt and decrypt private keys using NIP-49 (ncryptsec format) for secure storage.

## Basic Encryption and Decryption

<<< @/core/docs/snippets/key_create_store.ts

## Security Parameters

The `encryptToNcryptsec` method accepts optional parameters for tuning security:

```typescript
// Default security (log_n = 16)
// Fast: ~100ms, 64MB memory
const ncryptsec = signer.encryptToNcryptsec(password);

// Higher security (log_n = 20)
// Slower: ~2 seconds, 1GB memory, more resistant to brute force
const ncryptsec = signer.encryptToNcryptsec(password, 20);

// Custom security with key security byte
// ksb values:
//   0x00 = key has no privilege
//   0x01 = key has privilege
//   0x02 = unknown privilege (default)
const ncryptsec = signer.encryptToNcryptsec(password, 16, 0x01);
```

## Complete Example: Secure Key Storage

```typescript
import NDK, { NDKPrivateKeySigner, NDKEvent } from "@nostr-dev-kit/ndk";

class SecureKeyManager {
    private static STORAGE_KEY = "encrypted_nostr_key";

    // Save a signer securely
    static saveKey(signer: NDKPrivateKeySigner, password: string): void {
        const ncryptsec = signer.encryptToNcryptsec(password);
        localStorage.setItem(this.STORAGE_KEY, ncryptsec);
    }

    // Load a signer securely
    static loadKey(password: string): NDKPrivateKeySigner | null {
        const ncryptsec = localStorage.getItem(this.STORAGE_KEY);
        if (!ncryptsec) return null;

        try {
            return NDKPrivateKeySigner.fromNcryptsec(ncryptsec, password);
        } catch (error) {
            console.error("Failed to decrypt key:", error);
            return null;
        }
    }

    // Check if a key is stored
    static hasStoredKey(): boolean {
        return !!localStorage.getItem(this.STORAGE_KEY);
    }

    // Remove stored key
    static clearKey(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// Usage
async function main() {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.primal.net"] });

    // On first login or registration
    if (!SecureKeyManager.hasStoredKey()) {
        const signer = NDKPrivateKeySigner.generate();
        const password = prompt("Create a password to protect your key:");

        SecureKeyManager.saveKey(signer, password);
        ndk.signer = signer;
        console.log("New key created and saved!");
    } else {
        // On subsequent logins
        const password = prompt("Enter your password:");
        const signer = SecureKeyManager.loadKey(password);

        if (signer) {
            ndk.signer = signer;
            console.log("Key loaded successfully!");
        } else {
            console.error("Invalid password");
            return;
        }
    }

    await ndk.connect();

    // Use the signer normally
    const event = new NDKEvent(ndk, { kind: 1, content: "Hello from NDK!" });
    await event.sign();
    await event.publish();
}

main().catch(console.error);
```

## Advanced: Direct NIP-49 Utilities

For advanced use cases, you can access the raw NIP-49 functions:

<<< @/core/docs/snippets/nip-49-encrypting.ts

## Security Best Practices

1. **Use strong passwords**: Encourage users to use strong, unique passwords
2. **Choose appropriate log_n**: Higher values (18-20) for high-value keys, default (16) for most cases
3. **Never expose passwords**: Don't log or transmit passwords in plaintext
4. **Consider server-side encryption**: For additional security, encrypt the ncryptsec again before storing server-side
5. **Zero out memory**: When possible, clear password variables after use
6. **Handle errors gracefully**: Always catch decryption errors (wrong password, corrupted data)

## Migration from nsec Storage

If you're currently storing nsec values, migrate to ncryptsec:

```typescript
// Old approach (less secure)
const nsec = localStorage.getItem("nsec");
const signer = new NDKPrivateKeySigner(nsec);

// New approach (secure with password)
const password = prompt("Create a password:");
const ncryptsec = signer.encryptToNcryptsec(password);
localStorage.setItem("encrypted_key", ncryptsec);
localStorage.removeItem("nsec"); // Remove old insecure storage
```
