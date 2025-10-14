# Events

Events are at the heart of Nostr and the NDK framework.

## Creating an event

This is a basic example of creating an event.

<<< @/core/docs/snippets/create_event.ts

There is no need to fill in the event's `id`, `tags`, `pubkey`, `created_at`, `sig` -- when these are empty, NDK will automatically fill them in with the appropriate values.

## Tagging users (or events)

NDK automatically adds the appropriate tags for mentions in the content.

If the user wants to mention a user or an event, NDK will automatically add the appropriate tags:

<<< @/core/docs/snippets/tag_user.ts

Calling `event.sign()` will finalize the event, adding the appropriate tags, The resulting event will look like:

<<< @/core/docs/snippets/tag_user_result.json

## Signing Events

> [!NOTE]
> Please note that the behavior of `.sign()` is assuming you have a valid signer instance.  More about
> the different signers in the [signer documentation](/core/docs/fundamentals/signers.md).


### Default Signer

NDK uses the default signer `ndk.signer` to sign events.

<<< @/core/docs/snippets/sign_event.ts

Read more about signers in [the signer documentation](/core/docs/fundamentals/signers.md)

### Other signers

You can specify the use of a different signer to sign with different pubkeys.

<<< @/core/docs/snippets/sign_event_with_other_signers.ts
