# Storage Options

To make sure NDK persists sessions, you need to provide one of the following storage options.

## Local Storage

Suited for browser/web-app applications.

```typescript
import { LocalStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage('my-app-sessions') // Custom key
});
```

## File Storage

Common used for NodeJS application or CLI scripts.

```typescript
import { FileStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new FileStorage('./.ndk-sessions.json')
});
```

## Memory Storage

Temporary, mostly used for testing or short lived application logic.

```typescript
import { MemoryStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new MemoryStorage(), // No persistence
  autoSave: false
});
```