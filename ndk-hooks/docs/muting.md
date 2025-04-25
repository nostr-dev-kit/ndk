## Muting Users, Events, Hashtags, and Words

NDK React hooks provide a simple, unified API for muting and unmuting users, events, hashtags, and words. Muting is session-specific and updates the Nostr mute list (kind 10000 event) for the active user.

### Muting and Unmuting

Use the `useNDKMutes` hook to access the mute and unmute functions. These functions automatically determine the type of item (user, event, hashtag, or word).

#### Muting

```tsx
import { useNDKMutes } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

function MuteExample({ user, event }: { user: NDKUser; event: NDKEvent }) {
  const mute = useNDKMutes(s => s.mute);

  // Mute a user
  mute(user);

  // Mute an event
  mute(event);

  // Mute a hashtag
  mute('#nostr');

  // Mute a word
  mute('spam');
}
```

#### Unmuting

```tsx
import { useNDKMutes } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

function UnmuteExample({ user, event }: { user: NDKUser; event: NDKEvent }) {
  const unmute = useNDKMutes(s => s.unmute);

  // Unmute a user
  unmute(user);

  // Unmute an event
  unmute(event);

  // Unmute a hashtag
  unmute('#nostr');

  // Unmute a word
  unmute('spam');
}
```

#### Checking if an Item is Muted

```tsx
import { useIsItemMuted } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

function CheckMute({ user, event }: { user: NDKUser; event: NDKEvent }) {
  const isUserMuted = useIsItemMuted(user);
  const isEventMuted = useIsItemMuted(event);
  const isHashtagMuted = useIsItemMuted('#nostr');
  const isWordMuted = useIsItemMuted('spam');

  // Use these booleans in your UI logic
}
```

### Adding Extra Mute Items (Application-Level Mutes)

You can add extra items to the mute list at the application level (for example, to respect other people's mute lists or provide custom mute sources) without modifying the user's own mute list. These extra mutes are not published and are only used for filtering in your app.

```tsx
import { useNDKMutes } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser } from '@nostr-dev-kit/ndk';

function ExtraMuteExample() {
  const addExtraMuteItems = useNDKMutes(s => s.addExtraMuteItems);

  // Add extra muted users
  addExtraMuteItems([new NDKUser({ pubkey: 'pubkey1' }), new NDKUser({ pubkey: 'pubkey2' })]);

  // Add extra muted hashtags
  addExtraMuteItems(['#bitcoin', '#nostr']);

  // Add extra muted words
  addExtraMuteItems(['spam', 'scam']);

  // Add mixed items
  addExtraMuteItems([new NDKUser({ pubkey: 'pubkey3' }), '#bitcoin', 'spam']);
}
```

**Notes:**
- Muting and unmuting are persisted as Nostr kind 10000 events and will be respected by all NDK-powered clients that support mute lists.
- The mute list is automatically updated and published for the active session.
- Use `useIsItemMuted(item)` to check if any item is muted.
- Use `useNDKMutes(s => s.addExtraMuteItems)` for application-level mutes that should not be published or affect the user's own mute list.
- All internal details like initializing mutes, loading mute lists, and synchronizing with the session store are handled automatically.

Explore the exported hooks from `@nostr-dev-kit/ndk-hooks` for more advanced use cases.