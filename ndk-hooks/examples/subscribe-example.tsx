import React, { useState } from 'react';
import { useNDK, useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import NDK, { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';

/**
 * Example component demonstrating the use of the subscribe hook
 */
function SubscribeExample() {
  const { ndk, setNDK } = useNDK();
  const [initialized, setInitialized] = useState(false);
  
  // Initialize NDK when component mounts
  React.useEffect(() => {
    if (!initialized) {
      const newNDK = new NDK({
        explicitRelayUrls: ['wss://relay.damus.io', 'wss://relay.nostr.band'],
      });
      
      newNDK.connect().then(() => {
        setNDK(newNDK);
        setInitialized(true);
      });
    }
  }, [initialized, setNDK]);
  
  // Define our subscription filters
  const filters: NDKFilter[] = [
    {
      kinds: [1],  // Regular notes
      limit: 10    // Only 10 most recent notes
    }
  ];
  
  // Subscribe to events with the filters
  const { events, eose } = useSubscribe<NDKEvent>(filters);
  
  if (!initialized) {
    return <div>Initializing NDK...</div>;
  }
  
  return (
    <div>
      <h1>Nostr Events</h1>
      
      <div>
        <h2>Subscription Status</h2>
        <p>Connected to NDK: {ndk ? 'Yes' : 'No'}</p>
        <p>End of Stored Events: {eose ? 'Yes' : 'No'}</p>
        <p>Events received: {events.length}</p>
      </div>
      
      <div>
        <h2>Events</h2>
        {events.length === 0 ? (
          <p>No events received yet...</p>
        ) : (
          <ul>
            {events.map(event => (
              <li key={event.id}>
                <strong>{event.id.substring(0, 8)}...</strong>
                <p><small>From: {event.pubkey.substring(0, 8)}...</small></p>
                <p>{event.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SubscribeExample;