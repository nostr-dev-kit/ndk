# Muting Users, Hashtags, Words, and Events in React (NDK)

This snippet demonstrates how to use the `useMuteItem` hook from `@nostr-dev-kit/ndk-hooks` to mute users, hashtags, words, or specific events in a React application. This is useful for LLMs and automation tools that need to programmatically manage mute lists for Nostr clients.

## Example: Muting with `useMuteItem`

```tsx
import { useMuteItem } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

function MuteExample({ user, event }: { user: NDKUser; event: NDKEvent }) {
  const muteItem = useMuteItem();

  // Mute a user
  muteItem(user);

  // Mute a hashtag
  muteItem('#nostr');

  // Mute a word
  muteItem('spam');

  // Mute an event
  muteItem(event);
}
```

**Usage tips:**
- Pass an `NDKUser` to mute a user by pubkey.
- Pass a string starting with `#` to mute a hashtag.
- Pass a string (e.g., `spam`) to mute a word.
- Pass an `NDKEvent` to mute a specific event by ID.

The mute list is automatically updated and published for the active session. Use `useMuteList()` to access the current mute list data, and `useMuteFilter()` to filter events in your UI based on the mute list.