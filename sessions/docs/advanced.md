## React to Changes

Subscribe to session changes:

```typescript
const unsubscribe = sessions.subscribe((state) => {
    console.log('Active user:', state.activePubkey);
    console.log('Total sessions:', state.sessions.size);

    // Update your UI...
});

// Later, cleanup
unsubscribe();
```

## Read-Only Sessions

Create a read-only session without a signer. Configure `fetches` in the constructor:

```typescript
const sessions = new NDKSessionManager(ndk, {
    fetches: {
        follows: true,
        relayList: true
    }
});

const user = ndk.getUser({pubkey: somePubkey});
await sessions.login(user);

// Data is fetched and cached, but user can't sign events
```

## Using with NIP-07 (Browser Extensions)

```typescript
import {NDKNip07Signer} from '@nostr-dev-kit/ndk';

const sessions = new NDKSessionManager(ndk, {
    fetches: {
        follows: true,
        mutes: true
    }
});

const signer = new NDKNip07Signer();
await sessions.login(signer);
```

## CLI Example

Complete example for a Node.js CLI tool:

```typescript
#!/usr/bin/env node
import NDK from '@nostr-dev-kit/ndk';
import {NDKSessionManager, FileStorage} from '@nostr-dev-kit/sessions';
import {NDKPrivateKeySigner} from '@nostr-dev-kit/ndk';

const ndk = new NDK({explicitRelayUrls: ['wss://relay.damus.io']});
await ndk.connect();

const sessions = new NDKSessionManager(ndk, {
    storage: new FileStorage('./.ndk-sessions.json'),
    autoSave: true,
    fetches: {
        follows: true
    }
});

// Restore previous session
await sessions.restore();

if (!sessions.activeUser) {
    // First time - login
    const nsec = process.env.NOSTR_NSEC;
    if (!nsec) throw new Error('NOSTR_NSEC not set');

    const signer = new NDKPrivateKeySigner(nsec);
    await sessions.login(signer);

    console.log('Logged in as', sessions.activeUser.npub);
} else {
    console.log('Welcome back', sessions.activeUser.npub);
}

// Use the active session to publish
const event = new NDKEvent(ndk, {
    kind: 1,
    content: 'Hello from CLI!'
});

await event.publish();
console.log('Published:', event.id);

// Cleanup
sessions.destroy();
```