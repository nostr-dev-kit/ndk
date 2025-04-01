bsc# Subscribe Hook

The `useSubscribe` hook provides a convenient way to subscribe to Nostr events with React components.

## Usage

```tsx
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { type NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';

function MyComponent() {
  // Define filters
  const filters: NDKFilter[] = [
    { kinds: [1], limit: 10 }
  ];
  
  // Subscribe to events
  const { events, eose } = useSubscribe<NDKEvent>(filters);
  
  return (
    <div>
      <h2>Events: {events.length}</h2>
      <p>EOSE (End of Stored Events): {eose ? 'Yes' : 'No'}</p>
      
      {events.map(event => (
        <div key={event.id}>
          <h3>Event ID: {event.id}</h3>
          <p>Content: {event.content}</p>
        </div>
      ))}
    </div>
  );
}
```

## Options

The `useSubscribe` hook accepts the following options:

```tsx
const { events, eose, subscription } = useSubscribe<NDKEvent>(
  filters,
  {
    // Whether to wrap the event with the kind-specific class when possible
    wrap: true,
    
    // Whether to include deleted events
    includeDeleted: false,
    
    // Buffer time in ms, false to disable buffering
    bufferMs: 30,
    
    // Optional relay URLs to connect to
    relays: ['wss://relay.example.com']
  },
  [/* dependencies */]
);
```

### Parameters

- `filters`: An array of NDKFilter objects or `false` to avoid running the subscription
- `opts`: (Optional) Subscription options
- `dependencies`: (Optional) Dependencies to re-run the subscription when they change

### Return Value

- `events`: Array of received events
- `eose`: Boolean flag indicating End of Stored Events
- `subscription`: The underlying NDKSubscription object

## Performance Optimization

The hook uses event buffering to optimize performance when receiving many events in a short time. You can configure this behavior with the `bufferMs` option:

- Set to a number of milliseconds (default: 30ms)
- Set to `false` to disable buffering and process events immediately

## Cache Support

The hook automatically leverages the NDK cache adapter if one is configured with the NDK instance:

1. It checks if there are cached events available
2. It processes cached events before waiting for live events from relays

This provides a good user experience by showing existing data immediately.