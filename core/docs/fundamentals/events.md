# Events

Events are at the heart of the Nostr protocol and described in [NIP-01.](https://nostr-nips.com/nip-01). To support
a wide range of functionality, Nostr comes with [a number of event types](https://nostr-nips.com/#event-kinds) but you 
can also create your own.

## Creating an event

This is the simplest example of creating a text note [`kind:1`](https://nostr-nips.com/nip-01#kinds) event.

<<< @/core/docs/snippets/create_event.ts

No need to fill in event's `id`, `tags`, `pubkey`, `created_at`, NDK will do that (if not set).

## Tagging users (or events)

Tags tell the protocol about related entities like mentioned users, relays, topics, other events, etc. Details about
tags can be found in the [tags section of NIP-01](https://nostr-nips.com/nip-01#tags) and in [the reference list of
standardized tags](https://nostr-nips.com/#standardized-tags).

NDK automatically adds the appropriate tags for mentions in the content when a user or event is mentioned.

<<< @/core/docs/snippets/tag_user.ts

Calling `event.sign()` will finalize the event, adding the appropriate tags.

The resulting event will look like:

<<< @/core/docs/snippets/tag_user_result.json

## Interest event

Interest events are used to tell the network about your interest in a particular topic. Those events and are making use
of the [NIP-51](https://nostr-nips.com/nip-51) specification `kind:10015` events.

<<< @/core/docs/snippets/interest_event.ts

## Signing Events

> [!NOTE]
> Please note that the behavior of `.sign()` is assuming you have a valid signer instance.  
> More about the different signers in the [signer documentation](/core/docs/fundamentals/signers.md).

### Default Signer

NDK uses the default signer `ndk.signer` to sign events.

<<< @/core/docs/snippets/sign_event.ts

Read more about signers in [the signer documentation](/core/docs/fundamentals/signers.md)

### Other signers

You can specify the use of a different signer to sign with different pubkeys.

<<< @/core/docs/snippets/sign_event_with_other_signers.ts

## More examples

Additional example snippets of events can be found in the [snippets directory](/docs/snippets.md).