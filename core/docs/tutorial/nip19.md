# Working with NIP-19 Identifiers

NDK provides comprehensive support for NIP-19 identifiers (npub, nprofile, nevent, etc.), both for encoding/decoding
data and for working with NDK entities.

## Direct NIP-19 Utilities

NDK re-exports all NIP-19 utilities from nostr-tools for lightweight data conversion without needing to instantiate NDK
objects:

```typescript
import { nip19 } from '@nostr-dev-kit/ndk';

// Encoding
const npub = nip19.npubEncode(pubkey);
const nsec = nip19.nsecEncode(privateKey);
const note = nip19.noteEncode(eventId);

// Encoding with metadata
const nprofile = nip19.nprofileEncode({
    pubkey: "hexPubkey",
    relays: ["wss://relay1.example.com", "wss://relay2.example.com"]
});

const nevent = nip19.neventEncode({
    id: eventId,
    relays: ["wss://relay.example.com"],
    author: authorPubkey
});

const naddr = nip19.naddrEncode({
    kind: 30023,
    pubkey: authorPubkey,
    identifier: "article-slug",
    relays: ["wss://relay.example.com"]
});

// Decoding
const decoded = nip19.decode("npub1...");
console.log(decoded.type); // "npub"
console.log(decoded.data); // hex pubkey

// Type-specific decoding
if (decoded.type === 'nprofile') {
    console.log(decoded.data.pubkey);
    console.log(decoded.data.relays);
}
```

## Creating NDK Users from NIP-19

The `ndk.fetchUser()` method accepts NIP-19 encoded strings directly, automatically detecting and decoding the format:

```typescript
import NDK from '@nostr-dev-kit/ndk';

const ndk = new NDK({ /* ... */ });

// From npub
const user1 = await ndk.fetchUser("npub1n0sturny6w9zn2wwexju3m6asu7zh7jnv2jt2kx6tlmfhs7thq0qnflahe");

// From nprofile (includes relay hints)
const user2 = await ndk.fetchUser("nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p");

// From hex pubkey
const user3 = await ndk.fetchUser("3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d");

// From NIP-05 identifier
const user4 = await ndk.fetchUser("pablo@test.com");
const user5 = await ndk.fetchUser("test.com"); // Uses _@test.com

// Note: fetchUser is async and returns a Promise<NDKUser | undefined>
// For NIP-05 lookups, it may return undefined if the address cannot be resolved
```

## Encoding NDK Events

NDK events have a built-in `encode()` method that automatically determines the appropriate NIP-19 format:

```typescript
const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello Nostr!";
await event.sign();

// Automatically chooses the right format:
// - naddr for parameterized replaceable events
// - nevent for events with relay information
// - note for simple note references
const encoded = event.encode();

// Control relay hints
const encodedWith5Relays = event.encode(5); // Include up to 5 relay hints
```

## Working with Private Keys

The `NDKPrivateKeySigner` can be instantiated with an nsec:

```typescript
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

// From nsec
const signer = new NDKPrivateKeySigner("nsec1...");

// From hex private key
const signer2 = new NDKPrivateKeySigner("hexPrivateKey");
```

## Common Use Cases

### Converting between formats

```typescript
import { nip19 } from '@nostr-dev-kit/ndk';

// Convert hex pubkey to npub
function hexToNpub(hexPubkey: string): string {
    return nip19.npubEncode(hexPubkey);
}

// Extract pubkey from any NIP-19 identifier
function extractPubkey(nip19String: string): string | undefined {
    const decoded = nip19.decode(nip19String);

    switch (decoded.type) {
        case 'npub':
            return decoded.data;
        case 'nprofile':
            return decoded.data.pubkey;
        case 'naddr':
            return decoded.data.pubkey;
        case 'nevent':
            return decoded.data.author;
        default:
            return undefined;
    }
}
```

### Sharing content with relay hints

```typescript
// Create shareable event reference with relay hints
const event = await ndk.fetchEvent({ id: eventId });
const shareableLink = event.encode(3); // Include up to 3 relay hints

// Create user profile reference with relays
const user = ndk.getUser({ pubkey: userPubkey });
const nprofile = nip19.nprofileEncode({
    pubkey: user.pubkey,
    relays: ["wss://relay.damus.io", "wss://nos.lol"]
});
```

### Validating NIP-19 strings

```typescript
import { nip19 } from '@nostr-dev-kit/ndk';

function isValidNip19(str: string): boolean {
    try {
        nip19.decode(str);
        return true;
    } catch {
        return false;
    }
}

function isNpub(str: string): boolean {
    try {
        const decoded = nip19.decode(str);
        return decoded.type === 'npub';
    } catch {
        return false;
    }
}
```

## Best Practices

1. **Use NIP-19 for user-facing displays**: Always show npub/nprofile to users instead of hex pubkeys
2. **Include relay hints for better discovery**: When sharing events or profiles, include 2-3 relay hints
3. **Handle decoding errors**: Always wrap `nip19.decode()` in try-catch blocks
4. **Use the right tool**:
    - Use `nip19` utilities for pure data conversion
    - Use `ndk.getUser()` when you need an NDK User object
    - Use `event.encode()` for encoding existing NDK events