# NDK-Blossom Specification

This document outlines the specifications for the `@nostr-dev-kit/blossom` package, which extends the [Nostr Development Kit (NDK)](https://github.com/nostr-dev-kit/ndk) with support for the [Blossom protocol](https://github.com/hzrd149/blossom) for handling binary data in the nostr ecosystem.

## Core Concepts

### Blobs

In the context of the Blossom protocol, a "blob" refers to any piece of binary data (images, videos, audio files, documents, etc.) that is stored on a Blossom server. Blobs are identified by their SHA-256 hash, which serves as a unique identifier across the network.

### Blossom Servers

Blossom servers are specialized servers that store and serve binary data for the nostr ecosystem. These servers implement the Blossom protocol, which defines how blobs are uploaded, stored, retrieved, and managed.

### User Server Lists (Kind 10063)

Users can publish their preferred Blossom servers as kind 10063 events. These events contain a list of server URLs that the user trusts and prefers to use for their blob storage needs.

### Authentication Events (Kind 24242)

Authentication with Blossom servers uses nostr events (kind 24242) to verify user identity without requiring additional authentication mechanisms.

## Supported Features

NDK-Blossom implements the following features from the Blossom protocol:

### Blob Upload

Upload binary data to Blossom servers with proper handling of content types, file sizes, and user preferences.

```typescript
const blossom = new NDKBlossom(ndk);
const imeta = await blossom.upload(fileOrBlob, options);
```

The upload method returns an `NDKImetaTag` object containing metadata about the uploaded blob, including its URL, size, mime type, and dimensions (for images). This object conforms to the NDK's `NDKImetaTag` interface.

### Convert NDKImetaTag to Event Tag

After uploading a blob, you can convert the returned `NDKImetaTag` object to a properly formatted tag for inclusion in nostr events using the `imetaTagToTag` utility function from NDK:

```typescript
import { imetaTagToTag } from '@nostr-dev-kit/ndk/lib/utils/imeta';

const imeta = await blossom.upload(fileOrBlob);
const imetaTag = imetaTagToTag(imeta);

// Use in an event
const event = {
  kind: 1,
  content: 'Check out this image!',
  tags: [imetaTag]
};
```

### URL Healing

Fix broken Blossom URLs by finding alternative servers that host the same blob.

```typescript
const fixedUrl = await blossom.fixUrl(user, brokenUrl);
```

### Blob Listing

Retrieve a list of blobs uploaded by a specific user.

```typescript
const blobs = await blossom.listBlobs(user);
```

### Server Management

Add, remove, and manage Blossom servers in a user's server list (kind 10063).

```typescript
await blossom.addServer(user, serverUrl);
await blossom.removeServer(user, serverUrl);
const servers = await blossom.getServers(user);
```

### Progress Tracking

Monitor the progress of blob uploads, especially useful for large files.

```typescript
blossom.onUploadProgress = (progress, file, serverUrl) => {
  const percentage = Math.round((progress.loaded / progress.total) * 100);
  console.log(`Upload progress: ${percentage}%`);
  return 'continue'; // or 'abort' to cancel the upload
};
```

## Error Handling

NDK-Blossom provides specific error classes for different types of errors that can occur during Blossom operations:

- `BlossomError`: Base error class for all Blossom-related errors
- `UploadError`: Errors that occur during blob upload
- `ServerListError`: Errors related to user server lists
- `AuthError`: Authentication-related errors
- `URLHealingError`: Errors that occur during URL healing attempts

## Extension Points

NDK-Blossom is designed to be extensible, allowing developers to customize its behavior:

- Custom server selection strategies
- Custom authentication mechanisms
- Custom URL healing algorithms
- Progress tracking and reporting
- Error handling and recovery 