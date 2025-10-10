# NDK-Blossom Specification

## Overview

NDK-Blossom is an extension for NDK (Nostr Development Kit) that provides support for the [Blossom protocol](https://github.com/hzrd149/blossom). Blossom is a specification for storing blobs of data on publicly accessible servers using nostr public/private keys for identity verification.

This document outlines the features and functionality that will be implemented in NDK-Blossom.

## Core Concepts

### Blobs

Blobs are packs of binary data addressed by their SHA256 hash. In the Blossom protocol, these blobs can be:
- Images
- Videos
- Audio files
- Documents
- Any other binary data

### Blossom Servers

Blossom servers are HTTP endpoints that store and serve blobs. They implement the Blossom Upgrade Documents (BUDs) specification which includes endpoints for:
- Retrieving blobs
- Uploading blobs
- Listing blobs
- Deleting blobs
- Mirroring blobs
- Media optimization

### Server Discovery

Users can specify their preferred Blossom servers in a Kind 10063 event (User Server List). NDK-Blossom will:
1. Read this list to determine where to upload files
2. Search these servers when fixing URLs to find the correct server hosting a specific blob

### Imeta Tag Structure

NDK-Blossom uses the NDK's `NDKImetaTag` interface for blob metadata:

```typescript
interface NDKImetaTag {
    url?: string;     // URL of the blob
    blurhash?: string; // BlurHash for image preview
    dim?: string;     // Dimensions, e.g., "1200x800"
    alt?: string;     // Alternative text
    m?: string;       // MIME type
    x?: string;       // SHA-256 hash
    size?: string;    // Size in bytes (as string)
    fallback?: string[]; // Fallback URLs
    [key: string]: string | string[] | undefined;
}
```

## Supported Features

### 1. Blob Upload

NDK-Blossom will implement BUD-02 for uploading blobs to Blossom servers:

```typescript
// Create NDK and NDKBlossom instances
const ndk = new NDK();
const blossom = new NDKBlossom(ndk);

// Set callback for upload failures
blossom.onUploadFailed = (error: string) => console.log(error);

// Upload a file, returns an imeta (image metadata) compatible with nostr
const imeta = await blossom.upload(file);
```

The upload process will:
1. Check the user's Blossom servers list (Kind 10063)
2. Attempt to upload to the first server
3. If failed, try the next server in the list
4. Continue until successful or all servers have been tried

### 2. URL Healing

NDK-Blossom will implement functionality to fix broken or invalid Blossom URLs:

```typescript
const user = ndk.getUser(...);
const correctUrl = await blossom.fixUrl(user, url);
```

The URL healing process will:
1. Extract the blob hash from the URL
2. Check the user's Blossom servers list
3. Use HTTP HEAD requests to find a server that has the requested hash
4. If not found directly, search for the hash using `#x: [hash-in-url]` tags in the nostr network
5. Return the corrected URL with a valid Blossom server

### 3. Blob Retrieval

NDK-Blossom will implement BUD-01 for retrieving blobs:

```typescript
// Get a blob by its URL
const blob = await blossom.getBlob(url);

// Get a blob by its hash and user
const blob = await blossom.getBlobByHash(user, hash);
```

### 4. Blob Management

NDK-Blossom will implement functionality for managing blobs:

```typescript
// List blobs for a user
const blobs = await blossom.listBlobs(user);

// Delete a blob
await blossom.deleteBlob(hash);
```

### 5. Server Management

NDK-Blossom will provide utilities for managing Blossom servers:

```typescript
// Check if a server has a specific blob
const hasBlob = await blossom.checkServerForBlob(serverUrl, hash);

// Add a server to a user's server list
await blossom.addServerToUserList(serverUrl);

// Remove a server from a user's server list
await blossom.removeServerFromUserList(serverUrl);
```

### 6. Mirroring

NDK-Blossom will implement BUD-04 for mirroring blobs between servers:

```typescript
// Mirror a blob from one server to another
await blossom.mirrorBlob(sourceUrl, targetServer);
```

### 7. Media Optimization

NDK-Blossom will implement BUD-05 for media optimization:

```typescript
// Get optimized version of a blob
const optimizedBlob = await blossom.getOptimizedBlob(url, options);
```

## Authentication

All operations that require authentication will use the NDK's signing process to create and sign the necessary nostr events (kind 24242 for authorization as specified in BUD-01).

## Error Handling

NDK-Blossom will provide detailed error reporting through:
- Return values indicating success/failure
- Error callbacks for asynchronous operations
- Specific error types for different failure modes

## Integration with NDK

NDK-Blossom will integrate with the core NDK library:
- Extending NDK with Blossom functionality
- Using NDK's user and signing infrastructure
- Working with NDK's event system for searching and publishing

## Future Considerations

- Implementing BUD-09 for blob reporting
- Supporting additional optimization parameters
- Developing a UI component library for file uploads
- Adding batch upload/download capabilities
- Supporting encryption for private blobs 