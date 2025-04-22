# Authentication in NDK-Blossom

The Blossom protocol uses nostr events for authentication. NDK-Blossom handles this authentication process automatically, leveraging the signing capabilities of NDK.

## How Authentication Works

Blossom servers use Kind 24242 events (BUD-01) to authenticate users. These events:

1. Are signed by the user's private key
2. Contain a challenge from the server
3. Prove the user's identity to the server

NDK-Blossom abstracts this process, so you typically don't need to handle authentication manually.

## Setting Up Authentication

To use authenticated Blossom operations, you need an NDK instance with a configured signer:

```typescript
import { NDK, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';

// Set up NDK with a signer
const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.example.com'],
    signer: new NDKPrivateKeySigner('nsec...'), // Your private key
});

// Create an NDKBlossom instance
const blossom = new NDKBlossom(ndk);

await ndk.connect();

// Now you can use authenticated operations
await blossom.upload(file);
```

## Alternative Signers

NDK-Blossom works with any NDK signer:

### Browser Extension (NIP-07)

```typescript
import { NDK, NDKNip07Signer } from '@nostr-dev-kit/ndk';
import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';

const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.example.com'],
    signer: new NDKNip07Signer(),
});

const blossom = new NDKBlossom(ndk);

await ndk.connect();
```

### Remote Signer (NIP-46)

```typescript
import { NDK, NDKNip46Signer } from '@nostr-dev-kit/ndk';
import { NDKBlossom } from '@nostr-dev-kit/ndk-blossom';

const remoteSigner = new NDKNip46Signer(
    'bunker-url',
    'user-pubkey'
);

const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.example.com'],
    signer: remoteSigner,
});

const blossom = new NDKBlossom(ndk);

// Connect to signer
await remoteSigner.connect();

// Connect to relays
await ndk.connect();
```

## Authentication Flow

When you perform an operation requiring authentication:

1. NDK-Blossom sends a request to the Blossom server
2. If the server requires authentication, it returns a challenge
3. NDK-Blossom creates a Kind 24242 event with the challenge
4. The NDK signer signs the event
5. NDK-Blossom sends the signed event to the server
6. If valid, the server processes the original request

This happens automatically for all operations that require authentication.

## Operations Requiring Authentication

The following operations typically require authentication:

- Uploading a blob
- Deleting a blob
- Mirroring a blob
- Managing server preferences
- Media optimization (some servers)

## Troubleshooting Authentication

### Authentication Errors

If you encounter authentication errors:

```typescript
try {
    await blossom.upload(file);
} catch (error) {
    if (error.code === 'AUTH_REQUIRED') {
        console.error('Authentication required but not provided');
    } else if (error.code === 'AUTH_INVALID') {
        console.error('Authentication invalid (wrong pubkey or signature)');
    } else if (error.code === 'AUTH_EXPIRED') {
        console.error('Authentication expired, try again');
    }
}
```

### Manual Authentication

In some cases, you might want to manually handle authentication:

```typescript
// Get an authentication event for a specific server
const authEvent = await blossom.createAuthEvent('https://blossom.example.com');

// You can use this event directly
const response = await fetch('https://blossom.example.com/upload', {
    method: 'POST',
    headers: {
        'Authorization': `Nostr ${authEvent.id}`,
        'Content-Type': 'application/octet-stream',
    },
    body: fileData
});
```

## Permissions and Authorization

Blossom servers might have different authorization policies:

- Some servers only allow authorized users to upload
- Some restrict deletion to the original uploader
- Some might have quotas or size limits

NDK-Blossom handles these server responses appropriately, but you should be aware of potential restrictions.

## Custom Authentication Headers

For servers with custom authentication requirements:

```typescript
// Add custom headers to requests
const customHeaders = {
    'X-API-Key': 'your-api-key',
    'X-Custom-Auth': 'custom-value'
};

// Use custom headers with a blossom operation
await blossom.upload(file, { headers: customHeaders });
```

## Server-Specific Authentication

To use different authentication for different servers:

```typescript
// Configure server-specific settings
blossom.setServerConfig('https://server1.example.com', {
    headers: { 'X-API-Key': 'key-for-server1' }
});

blossom.setServerConfig('https://server2.example.com', {
    headers: { 'X-API-Key': 'key-for-server2' }
});

// Use automatic server-specific authentication
await blossom.upload(file);
``` 