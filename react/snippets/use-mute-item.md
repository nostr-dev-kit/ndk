# Muting, Unmuting, and Checking Mutes in React (NDK)

This snippet demonstrates how to use the current mute API from `@nostr-dev-kit/react` to mute, unmute, and check mute status for users, events, hashtags, or words in a React application. These focused examples are designed for LLMs and automation tools.

---

## Muting an Event or User

```tsx
import { useNDKMutes } from '@nostr-dev-kit/react';
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

---

## Unmuting an Event or User

```tsx
import { useNDKMutes } from '@nostr-dev-kit/react';
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

---

## Checking if an Item is Muted

```tsx
import { useIsItemMuted } from '@nostr-dev-kit/react';
import { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

function CheckMute({ user, event }: { user: NDKUser; event: NDKEvent }) {
  const isUserMuted = useIsItemMuted(user);
  const isEventMuted = useIsItemMuted(event);
  const isHashtagMuted = useIsItemMuted('#nostr');
  const isWordMuted = useIsItemMuted('spam');

  // Use these booleans in your UI logic
}
```

---

## Adding Extra Mute Items (Application-Level Mutes)

Extra mutes are application-provided mute items that are not included in the published mute list. Use this to mute items at the application level (e.g., to respect other people's mute lists or provide custom mute sources) without modifying the user's own mute list.

```tsx
import { useNDKMutes } from '@nostr-dev-kit/react';
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
- Extra mutes are stored at the application level, not per user.
- Extra mutes are NOT included in the published mute list.
- Extra mutes are checked when filtering events with `useIsItemMuted` or `useMuteFilter`.
- Use `addExtraMuteItems` for application-specific mutes that should not affect the user's own mute list.