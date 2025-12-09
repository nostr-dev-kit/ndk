# Working with NIP-19 Identifiers

NDK provides comprehensive support for NIP-19 identifiers (npub, nprofile, nevent, etc.), both for encoding/decoding
data and for working with NDK entities.

## NIP-19 Encode/Decode

NDK re-exports all NIP-19 utilities from nostr-tools for lightweight data conversion without needing to encode Nostr
entities:

<<< @/core/docs/snippets/nip-19-encoding.ts

Or for decoding

<<< @/core/docs/snippets/nip-19-decoding.ts

## User Fetching

The `ndk.fetchUser()` method accepts NIP-19 encoded strings directly, automatically detecting and decoding the format:

<<< @/core/docs/snippets/user-fetching.ts

## Encoding NDK Events

NDK events have a built-in `encode()` method that automatically determines the appropriate NIP-19 format:

<<< @/core/docs/snippets/event_encode.ts

## Working with Private Keys

The `NDKPrivateKeySigner` can be instantiated with an nsec:

<<< @/core/docs/snippets/private-signer.ts

## Converting between formats

<<< @/core/docs/snippets/nip-19-conversion.ts

## Sharing content with relay hints

<<< @/core/docs/snippets/nip-19-profile-event.ts

## Validating NIP-19 strings

<<< @/core/docs/snippets/nip-19-validate.ts

## Best Practices

1. **Use NIP-19 for user-facing displays**: Always show npub/nprofile to users instead of hex pubkeys
2. **Include relay hints for better discovery**: When sharing events or profiles, include 2-3 relay hints
3. **Handle decoding errors**: Always wrap `nip19.decode()` in try-catch blocks
4. **Use the right tool**:
    - Use `nip19` utilities for pure data conversion
    - Use `ndk.getUser()` when you need an NDK User object
    - Use `event.encode()` for encoding existing NDK events