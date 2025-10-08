# Subscribing to Events in Mobile Apps

The primary way to subscribe to Nostr events in your React Native application using NDK is through the `useSubscribe` hook provided by the `@nostr-dev-kit/react` package.

This hook handles the underlying NDK subscription logic, manages event state (including buffering and handling replaceable events), and integrates with the session management features (like mute lists) provided by `ndk-hooks`.

## Basic Usage

1.  **Import:** Import `useSubscribe` from `@nostr-dev-kit/react`.
2.  **Define Filters:** Create an array of `NDKFilter` objects specifying the events you want to subscribe to.
3.  **Call the Hook:** Pass the filters and any desired options to the hook.

```typescript
import React, { useMemo } from 'react';
import { NDKFilter, NDKKind } from '@nostr-dev-kit/ndk';
import { useSubscribe } from '@nostr-dev-kit/react';

function MyComponent() {
    // Define the filter for kind 1 notes
    const filter = useMemo((): NDKFilter[] => {
        return [{ kinds: [NDKKind.Text] as number[], limit: 20 }];
    }, []);

    // Subscribe to events
    const { events, eose, subscription } = useSubscribe(filter, {
        closeOnEose: false, // Keep subscription open after initial fetch
        bufferMs: 100,      // Buffer events for 100ms
        includeMuted: false // Exclude events from muted users (default)
    });

    // You can check if `subscription` is defined to see if the subscription is active,
    // but often checking `eose` or the presence of `events` is sufficient for UI logic.
    if (events.length === 0 &amp;&amp; !eose) {
        return <p>Loading initial events...</p>;
    }

    return (
        <div>
            <h2>Latest Notes</h2>
            <ul>
                {events.map((event) => (
                    <li key={event.id}>{event.content}</li>
                ))}
            </ul>
            {eose &amp;&amp; <p>End of stored events reached.</p>}
        </div>
    );
}

export default MyComponent;

```

## Key Features

*   **Automatic State Management:** Handles event arrays and EOSE status. Returns a reference to the underlying subscription object.
*   **Buffering:** Reduces re-renders by batching incoming events.
*   **Replaceable Event Handling:** Automatically manages NIP-01 replaceable events (kinds 0, 3, 4, 10000-19999, 30000-39999).
*   **Mute Integration:** Automatically filters events based on the active session's mute lists (pubkeys, hashtags, words, event IDs) unless `includeMuted` is set to `true`.
*   **Custom Relays:** Allows specifying a custom set of relays for the subscription.

Refer to the `@nostr-dev-kit/react` package for more detailed API documentation and advanced options.