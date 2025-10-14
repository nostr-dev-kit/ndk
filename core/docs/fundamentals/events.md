# Events

Events are at the heart of Nostr and the NDK framework.

## Creating an event

This is a basic example of creating an event.

<<< @/core/docs/snippets/create_event.ts

There is no need to fill in the event's `id`, `tags`, `pubkey`, `created_at`, `sig` -- when these are empty, NDK will automatically fill them in with the appropriate values.

## Signing Events

NDK uses the default signer `ndk.signer` to sign events.

<<< @/core/docs/snippets/sign_event.ts

Read more about signers in [the signer documentation](/core/docs/fundamentals/signers.md)