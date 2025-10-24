# Getting Started with NDK-Blossom

NDK-Blossom extends NDK with support for the [Blossom protocol](https://github.com/hzrd149/blossom), enabling you to easily upload, manage, and fix URLs for blobs (binary data like images, videos, etc.) stored on Blossom servers.

## Installation

```bash
# Using npm
npm install @nostr-dev-kit/blossom

# Using yarn
yarn add @nostr-dev-kit/blossom

# Using bun
bun add @nostr-dev-kit/blossom
```

## Basic Setup

```typescript
import { NDK } from '@nostr-dev-kit/ndk';
import { NDKBlossom } from '@nostr-dev-kit/blossom';

// Create an NDK instance
const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.example.com'],
    // Add any other NDK configuration
});

// Create an NDKBlossom instance
const blossom = new NDKBlossom(ndk);

// Connect to NDK
await ndk.connect();
```

## File Upload

NDK-Blossom makes it easy to upload files to Blossom servers. It automatically tries the user's preferred Blossom servers until it succeeds.

### Upload with Fallback and Custom Server Options

You can control which server(s) are used for uploads by passing options to the `upload` method:

#### Fallback Server

If the user's Blossom server list is empty or all uploads fail, you can provide a fallback server:

```typescript
await blossom.upload(file, {
    fallbackServer: "https://your-fallback-blossom.example.com"
});
```

#### Custom Server (Bypass Blossom List)

To always use a specific server and skip the user's Blossom list entirely:

```typescript
await blossom.upload(file, {
    server: "https://your-custom-blossom.example.com"
});
```

#### Option Reference

| Option          | Type     | Description                                                                                 |
|-----------------|----------|---------------------------------------------------------------------------------------------|
| `server`        | string   | If provided, always use this server for upload (bypasses blossom list and fallback).         |
| `fallbackServer`| string   | If no blossom servers are available or all fail, use this server as a fallback.             |
| `maxRetries`    | number   | Maximum number of retry attempts for network requests.                                      |
| `retryDelay`    | number   | Delay between retry attempts in milliseconds.                                               |
| `headers`       | object   | Additional headers to include in the upload request.                                        |
| `onProgress`    | function | Callback for upload progress.                                                               |

See the [API documentation](./) for more details.
```typescript
import { imetaTagToTag } from '@nostr-dev-kit/ndk/lib/utils/imeta';

// Optional: set an error handler for upload failures
blossom.onUploadFailed = (error: string) => {
    console.error('Upload failed:', error);
};

// Optional: track upload progress (useful for large files like videos)
blossom.onUploadProgress = (progress, file, serverUrl) => {
    // Calculate percentage
    const percentage = Math.round((progress.loaded / progress.total) * 100);
    console.log(`Uploading ${file.name}: ${percentage}%`);
    
    // Update UI with progress
    updateProgressBar(percentage);
    
    return 'continue'; // or return 'cancel' to abort the upload
};

// Get a file from an input element or other source
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
    try {
        // Upload the file
        const imeta = await blossom.upload(file);
        
        // The imeta object includes the URL and other metadata about the uploaded file
        console.log('File uploaded successfully:', imeta);
        
        // Convert the imeta object to a proper tag for nostr events
        const imetaTag = imetaTagToTag(imeta);
        
        // Use the tag in a nostr note
        const event = {
            kind: 1,
            content: `Check out this file: ${imeta.url}`,
            tags: [imetaTag]
        };
        
        // Publish the note
        await ndk.publish(event);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}
```

The `imetaTagToTag` function properly formats the NDKImetaTag object into a tag that can be included in nostr events. For example, an imeta object like:

```javascript
{
  url: "https://example.com/abc123...",
  x: "abc123...",
  m: "image/jpeg",
  size: "24000",
  dim: "800x600"
}
```

Will be converted to a tag like:

```javascript
["imeta", "url https://example.com/abc123...", "x abc123...", "m image/jpeg", "size 24000", "dim 800x600"]
```

## URL Healing

Blossom URLs might become invalid if a server goes down. NDK-Blossom can automatically "heal" these URLs by finding alternative servers hosting the same content.

```typescript
// Get a user
const user = ndk.getUser({ npub: 'npub...' });

// Fix a potentially broken URL
const brokenUrl = 'https://down-server.example/abc123...'; // Blossom URL that's not working
try {
    const fixedUrl = await blossom.fixUrl(user, brokenUrl);
    console.log('Fixed URL:', fixedUrl);
    
    // Use the fixed URL
    document.getElementById('image').src = fixedUrl;
} catch (error) {
    console.error('Could not fix URL:', error);
}
```

## Listing User's Blobs

You can list all blobs uploaded by a user:

```typescript
// Get a user
const user = ndk.getUser({ npub: 'npub...' });

// List all blobs
try {
    const blobs = await blossom.listBlobs(user);
    console.log('User blobs:', blobs);
    
    // Display the blobs
    blobs.forEach(blob => {
        console.log(`Blob: ${blob.url}, Size: ${blob.size}, Type: ${blob.m}`);
        
        // Convert each blob to a proper imeta tag if needed
        const tag = imetaTagToTag(blob);
    });
} catch (error) {
    console.error('Error listing blobs:', error);
}
```

## Managing Blossom Servers

Users can manage their preferred Blossom servers through the NDKBlossomList class:

```typescript
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { NDKBlossomList } from '@nostr-dev-kit/ndk/lib/events/kinds/blossom-list.js';

// Get the user's existing blossom server list or create a new one
const filter = {
  kinds: [NDKKind.BlossomList],
  authors: [user.pubkey],
};

let blossomList: NDKBlossomList;
const event = await ndk.fetchEvent(filter);

if (event) {
  // Use existing list
  blossomList = NDKBlossomList.from(event);
} else {
  // Create a new list
  blossomList = new NDKBlossomList(ndk);
}

// Add a server to the list (saved as ["server", "https://blossom.example.com"] tags)
blossomList.addServer('https://blossom.example.com');

// Remove a server from the list
blossomList.removeServer('https://old-server.example.com');

// Set the default server (will be first in the list)
blossomList.default = 'https://preferred-server.example.com';

// Get the current default server
const defaultServer = blossomList.default;

// Get all servers
const allServers = blossomList.servers;

// Save changes
await blossomList.publish();
```

## Advanced Usage

For more advanced usage examples, refer to the following documentation pages:
- [Mirroring Blobs](./mirroring.md)
- [Media Optimization](./optimization.md)
- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md) 