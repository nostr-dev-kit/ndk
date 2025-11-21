# Events

Events are at the heart of the Nostr protocol and described
in [NIP-01.](https://github.com/nostr-protocol/nips/blob/master/01.md). To support
a wide range of functionality, Nostr comes
with [a number of event types](https://github.com/nostr-protocol/nips/blob/master/Readme.md#event-kinds) but you
can also create your own.

## Creating an event

This is the simplest example of creating a text note [
`kind:1`](https://github.com/nostr-protocol/nips/tree/master?tab=readme-ov-file#event-kinds) event.

<<< @/core/docs/snippets/create_event.ts

No need to fill in event's `id`, `tags`, `pubkey`, `created_at`, NDK will do that (if not set).

## Tagging users (or events)

Tags tell the protocol about related entities like mentioned users, relays, topics, other events, etc. Details about
tags can be found in the [tags section of NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md#tags) and
in [the reference list of
standardized tags](https://github.com/nostr-protocol/nips/tree/master?tab=readme-ov-file#common-tags).

NDK automatically adds the appropriate tags for mentions in the content when a user or event is mentioned.

<<< @/core/docs/snippets/tag_user.ts

Calling `event.sign()` will finalize the event, adding the appropriate tags.

The resulting event will look like:

<<< @/core/docs/snippets/tag_user_result.json

## Signing Events

NDK uses the default signer `ndk.signer` to sign events.

<<< @/core/docs/snippets/sign_event.ts

Read more about signers in [the signer documentation](/core/docs/fundamentals/signers.md)

## Code Snippets

More snippets and examples can be found in the [snippets directory](/docs/snippets.md#events).
