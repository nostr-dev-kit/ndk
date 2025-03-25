# Basic Nostr Event generation

NDK uses `NDKEvent` as the basic interface to generate and handle nostr events.

## Generating a basic event

```ts
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

const ndk = new NDK(/* initialization options for the ndk singleton */);

const event = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: "Hello world",
});
```

There is no need to fill in the event's `id`, `tags`, `pubkey`, `created_at`, `sig` -- when these are empty, NDK will automatically fill them in with the appropriate values.
