# Muting Users, Hashtags, Words, and Events in React (NDK)

This snippet demonstrates how to use the mute hooks from `@nostr-dev-kit/ndk-hooks` to mute users, hashtags, words, or specific events in a React application. This is useful for LLMs and automation tools that need to programmatically manage mute lists for Nostr clients.

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


## Example: Adding Extra Mute Items

Extra mutes are application-provided mute items that won't be included in the published mute list.

```tsx
import { useNDKMutes } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser } from '@nostr-dev-kit/ndk';

function ExtraMuteExample() {
  const addExtraMuteItems = useNDKMutes(s => s.addExtraMuteItems);

  // Add extra muted pubkeys
  addExtraMuteItems([
    new NDKUser({ pubkey: 'pubkey1' }),
    new NDKUser({ pubkey: 'pubkey2' })
  ]);

  // Add extra muted hashtags
  addExtraMuteItems(['#bitcoin', '#nostr']);

  // Add extra muted words
  addExtraMuteItems(['spam', 'scam']);

  // Add mixed items
  addExtraMuteItems([
    new NDKUser({ pubkey: 'pubkey3' }),
    '#bitcoin',
    'spam'
  ]);
}
```

**Usage tips:**
- Pass an `NDKUser` to mute a user by pubkey.
- Pass a string starting with `#` to mute a hashtag.
- Pass a string (e.g., `spam`) to mute a word.
- Pass an `NDKEvent` to mute a specific event by ID.
- Use `useNDKMutes(s => s.addExtraMuteItems)` for application-specific mutes that shouldn't be published.

The mute list is automatically updated and published for the active session. Use `useMuteList()` to access the current mute list data, and `useMuteFilter()` to filter events in your UI based on the mute list.

**Note about Extra Mutes:**
- Extra mutes are stored at the application level, not per user
- Extra mutes are NOT included in the published mute list
- Extra mutes are checked when filtering events with `useMuteFilter()`
- Extra mutes allow applications to provide custom sources of muted items