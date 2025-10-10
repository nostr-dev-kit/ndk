# NDK-Blossom

NDK-Blossom is an extension for [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) that adds support for the [Blossom protocol](https://github.com/hzrd149/blossom), making it easy to upload, manage, and interact with binary data (images, videos, documents, etc.) stored on Blossom servers.

## Features

- **File Upload**: Upload files to Blossom servers with automatic server selection
- **URL Healing**: Fix broken Blossom URLs by finding alternative servers with the same content
- **Blob Management**: List, retrieve, and delete blobs
- **Server Discovery**: Find and use Blossom servers from user preferences (Kind 10063)
- **Mirroring**: Copy blobs between Blossom servers for redundancy
- **Media Optimization**: Access optimized versions of media blobs (resized, format conversion)
- **Authentication**: Seamless authentication using nostr events (Kind 24242)
- **Pluggable SHA256**: Replace the default SHA256 calculation with your own implementation

## Installation

```bash
# Using npm
npm install @nostr-dev-kit/blossom

# Using yarn
yarn add @nostr-dev-kit/blossom

# Using bun
bun add @nostr-dev-kit/blossom
```

## Quick Start

```typescript
import { NDK } from '@nostr-dev-kit/ndk';
import { NDKBlossom } from '@nostr-dev-kit/blossom';
import { imetaTagToTag } from '@nostr-dev-kit/ndk/lib/utils/imeta';

// Create NDK instance
const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.example.com']
});

// Create NDKBlossom instance
const blossom = new NDKBlossom(ndk);

// Connect to NDK
await ndk.connect();

// Upload a file
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
    // Handle upload failures
    blossom.onUploadFailed = (error) => console.error(error);
    
    // Track upload progress (especially useful for large files)
    blossom.onUploadProgress = (progress, file, serverUrl) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        console.log(`Upload progress: ${percentage}%`);
        return 'continue';
    };
    
    // Upload the file
    const imeta = await blossom.upload(file);
    console.log('File uploaded:', imeta);
    
    // Convert the imeta object to a proper tag for nostr events
    const imetaTag = imetaTagToTag(imeta);
    
    // Use the URL in a nostr note
    const note = await ndk.publish({
        kind: 1,
        content: `Check out this file: ${imeta.url}`,
        tags: [imetaTag] // Use the properly formatted imeta tag
    });
}

// Fix a broken URL
const user = ndk.getUser({ npub: 'npub...' });
const fixedUrl = await blossom.fixUrl(user, 'https://broken-server.example/abcdef123...');
```

## Documentation

For full documentation, see the [documentation directory](./docs/):

- [Getting Started](./docs/getting-started.md)
- [Mirroring Blobs](./docs/mirroring.md)
- [Media Optimization](./docs/optimization.md)
- [Authentication](./docs/authentication.md)
- [Error Handling](./docs/error-handling.md)

## Blossom Protocol

NDK-Blossom implements the [Blossom protocol](https://github.com/hzrd149/blossom), which includes several Blossom Upgrade Documents (BUDs):

- BUD-01: Server requirements and blob retrieval
- BUD-02: Blob upload and management
- BUD-03: User Server List
- BUD-04: Mirroring blobs
- BUD-05: Media optimization
- BUD-06: Upload requirements
- BUD-08: Nostr File Metadata Tags
- BUD-09: Blob Report

## Custom SHA256 Implementation

NDK-Blossom allows you to provide your own SHA256 calculation implementation:

```typescript
import { NDK } from '@nostr-dev-kit/ndk';
import { NDKBlossom, SHA256Calculator } from '@nostr-dev-kit/blossom';

// Create NDK instance
const ndk = new NDK();

// Create NDKBlossom instance
const blossom = new NDKBlossom(ndk);

// Create a custom SHA256 calculator
class CustomSHA256Calculator implements SHA256Calculator {
    async calculateSha256(file: File): Promise<string> {
        // Your custom implementation here
        // For example, using a different hashing library
        // or modifying how hashing is performed
        
        // Example using a hypothetical external library:
        // return await externalHashLibrary.hashFile(file);
        
        // Must return a hex string representation of the hash
        return "...custom implementation...";
    }
}

// Set the custom calculator
blossom.setSHA256Calculator(new CustomSHA256Calculator());

// Or provide it directly during upload
const imeta = await blossom.upload(file, {
    sha256Calculator: new CustomSHA256Calculator()
});
```

This feature is useful for:
- Implementing platform-specific optimizations
- Using special hardware acceleration for hashing
- Integrating with custom security requirements
- Testing with deterministic hash outputs

## License

MIT 