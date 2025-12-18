# Helpers

NDK comes with a ton of additional helpers and utilities to do things faster. A number of those utilities come from the
[nostr-tools library](https://github.com/nbd-wtf/nostr-tools) which is included as part of NDK

## NIP-19 Identifiers

NDK re-exports [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) from the
[nostr-tools library](https://github.com/nbd-wtf/nostr-tools):

### Encoding

<<< @/core/docs/snippets/nip-19-encoding.ts

### Decoding

<<< @/core/docs/snippets/nip-19-decoding.ts

## NIP-49 Encryption

NDK re-exports [NIP-49](https://github.com/nostr-protocol/nips/blob/master/49.md) from the
[nostr-tools library](https://github.com/nbd-wtf/nostr-tools):

<<< @/core/docs/snippets/nip-49-encrypting.ts

## Fetching Users

The `ndk.fetchUser()` method accepts [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) encoded strings
directly, automatically detecting and decoding the format:

<<< @/core/docs/snippets/user-fetching.ts

## Generate Keys

By using `NDKPrivateKeySigner` you can create keysets for signing and verifying messages.

This snippet demonstrates how to generate a new key pair and obtain all its various formats (private key, public key,
nsec, npub).

<<< @/core/docs/snippets/key_create.ts

More about key generaton in [the signer documentation](/core/docs/fundamentals/signers).

## Code Snippets

More snippets and examples can be found in the [snippets directory](/docs/snippets.md#helpers)






