# NDK Store and Hooks - Examples

This document provides practical examples for using the NDK store and hooks in your React applications.

## Basic NDK Demo

The following example demonstrates how to:
- Initialize an NDK instance
- Set it in the store using useNDK
- Access and use the current user with useNDKCurrentUser
- Handle the 'signer:ready' event

```tsx
import React, { useEffect, useState } from 'react';
import NDK, { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function NDKDemo() {
  const { ndk, setNDK } = useNDK();
  const { currentUser, setCurrentUser } = useNDKCurrentUser();
  const [status, setStatus] = useState('Initializing');
  
  // Initialize NDK on component mount
  useEffect(() => {
    const initializeNDK = async () => {
      try {
        // Create a new NDK instance with a browser extension signer
        const signer = new NDKNip07Signer();
        const ndkInstance = new NDK({
          explicitRelayUrls: [
            'wss://relay.nostr.band',
            'wss://relay.damus.io',
            'wss://nos.lol',
          ],
          signer,
        });
        
        // Listen for signer:ready event explicitly (for demo purposes)
        ndkInstance.on('signer:ready', () => {
          setStatus('Signer ready');
          // Note: currentUser will be automatically set by the store's event handler
          // This is just to demonstrate the event flow
        });
        
        // Connect to relays
        await ndkInstance.connect();
        setStatus('Connected to relays');
        
        // Set the NDK instance in the store
        // This will automatically register event listeners, including signer:ready
        setNDK(ndkInstance);
        
        // The currentUser will be set automatically when signer:ready is triggered
      } catch (error) {
        console.error('Failed to initialize NDK:', error);
        setStatus('Error: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    
    initializeNDK();
    
    // Clean up function (if needed)
    return () => {
      setStatus('Cleaned up');
    };
  }, [setNDK]);
  
  // Function to manually set the current user
  const handleLogin = async () => {
    if (!ndk) {
      setStatus('NDK not initialized');
      return;
    }
    
    try {
      // Ensure signer is ready
      if (ndk.signer) {
        await ndk.signer.blockUntilReady();
      }
      
      // Get the user
      const user = ndk.getUser();
      setCurrentUser(user);
      setStatus('Logged in');
    } catch (error) {
      console.error('Login failed:', error);
      setStatus('Login failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // Function to log out
  const handleLogout = () => {
    setCurrentUser(null);
    setStatus('Logged out');
  };
  
  return (
    <div className="ndk-demo">
      <h1>NDK Demo</h1>
      
      <div className="status">
        <h2>Status: {status}</h2>
        <p>NDK Initialized: {ndk ? 'Yes' : 'No'}</p>
        <p>Current User: {currentUser ? `${currentUser.pubkey.slice(0, 8)}...` : 'None'}</p>
      </div>
      
      <div className="actions">
        <button 
          onClick={handleLogin} 
          disabled={!ndk || !!currentUser}
        >
          Login with Extension
        </button>
        
        <button 
          onClick={handleLogout} 
          disabled={!currentUser}
        >
          Logout
        </button>
      </div>
      
      {currentUser && (
        <div className="user-info">
          <h2>User Information</h2>
          <p><strong>Public Key:</strong> {currentUser.pubkey}</p>
          
          <button 
            onClick={async () => {
              if (!ndk || !currentUser) return;
              
              try {
                // Example: Post a simple note
                const event = await currentUser.publish({
                  kind: 1,
                  content: 'Hello from NDK Demo!',
                });
                
                setStatus(`Published event: ${event.id}`);
              } catch (error) {
                console.error('Failed to publish:', error);
                setStatus('Publish failed: ' + (error instanceof Error ? error.message : String(error)));
              }
            }}
          >
            Publish Test Note
          </button>
        </div>
      )}
    </div>
  );
}

export default NDKDemo;
```

## Using NDK in a Provider Pattern

A common pattern is to initialize the NDK instance at the application root and provide it to all components:

```tsx
import React, { useEffect } from 'react';
import NDK from '@nostr-dev-kit/ndk';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';

// NDK Provider component
function NDKProvider({ children }) {
  const { setNDK } = useNDK();
  
  useEffect(() => {
    const setupNDK = async () => {
      const ndk = new NDK({
        explicitRelayUrls: [
          'wss://relay.nostr.band',
          'wss://relay.damus.io',
          'wss://nos.lol',
        ],
      });
      
      await ndk.connect();
      setNDK(ndk);
    };
    
    setupNDK();
  }, [setNDK]);
  
  return <>{children}</>;
}

// Root App component
function App() {
  return (
    <NDKProvider>
      <div className="app">
        {/* Your app components */}
        <Header />
        <MainContent />
        <Footer />
      </div>
    </NDKProvider>
  );
}

// Component that uses NDK
function MainContent() {
  const { ndk } = useNDK();
  const { currentUser } = useNDKCurrentUser();
  
  if (!ndk) {
    return <div>Loading NDK...</div>;
  }
  
  return (
    <div>
      <h1>Main Content</h1>
      {currentUser ? (
        <p>Logged in as: {currentUser.pubkey.slice(0, 8)}...</p>
      ) : (
        <p>Not logged in</p>
      )}
      {/* Rest of your application */}
    </div>
  );
}
```

## Working with NDK Events

This example shows how to work with NDK events:

```tsx
import React, { useEffect, useState } from 'react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, NDKKind, NDKSubscription } from '@nostr-dev-kit/ndk';

function EventListener() {
  const { ndk } = useNDK();
  const [notes, setNotes] = useState<NDKEvent[]>([]);
  const [subscription, setSubscription] = useState<NDKSubscription | null>(null);
  
  // Set up a subscription when NDK is ready
  useEffect(() => {
    if (!ndk) return;
    
    // Create a subscription for text notes (kind 1)
    const sub = ndk.subscribe({
      kinds: [NDKKind.Text],
      limit: 10,
    });
    
    // Store events as they come in
    const events: NDKEvent[] = [];
    
    sub.on('event', (event: NDKEvent) => {
      events.push(event);
      setNotes([...events]); // Update state with a new array
    });
    
    // Store the subscription for cleanup
    setSubscription(sub);
    
    // Clean up the subscription when the component unmounts
    return () => {
      sub.stop();
    };
  }, [ndk]);
  
  return (
    <div>
      <h2>Recent Notes</h2>
      {notes.length === 0 ? (
        <p>Waiting for notes...</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <p><strong>{note.author.pubkey.slice(0, 8)}...</strong>: {note.content}</p>
              <small>
                {new Date(note.created_at! * 1000).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
      
      <button 
        onClick={() => subscription?.stop()}
        disabled={!subscription}
      >
        Stop Subscription
      </button>
    </div>
  );
}
```

These examples demonstrate the fundamental patterns for using the NDK store and hooks in your React applications. You can adapt and extend these examples to build more complex Nostr-enabled applications.