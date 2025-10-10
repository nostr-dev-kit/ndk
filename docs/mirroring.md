# Mirroring Blobs with NDK-Blossom

Mirroring is the process of copying a blob from one Blossom server to another. This is useful for:

- **Redundancy**: Ensuring your content is available even if one server goes down
- **Geographical Distribution**: Storing content closer to your users
- **Migration**: Moving content from one server to another

NDK-Blossom makes it easy to mirror blobs between Blossom servers.

## Basic Mirroring

To mirror a blob from one server to another:

```typescript
// Mirror a blob from its current URL to a target server
await blossom.mirrorBlob(
    'https://source-server.example/abcdef123456...', // Source URL
    'https://target-server.example'                  // Target server
);

// The function returns the new URL on the target server
const newUrl = await blossom.mirrorBlob(
    'https://source-server.example/abcdef123456...',
    'https://target-server.example'
);
console.log('Mirrored blob available at:', newUrl);
```

## Mirroring by Hash

You can also mirror a blob if you only know its hash:

```typescript
// Mirror a blob using its hash
const hash = 'abcdef123456...'; // SHA256 hash of the blob
const newUrl = await blossom.mirrorBlobByHash(
    hash,
    'https://target-server.example'
);
```

## Batch Mirroring

For mirroring multiple blobs at once:

```typescript
// Mirror multiple blobs from one server to another
const sourceUrls = [
    'https://source-server.example/hash1...',
    'https://source-server.example/hash2...',
    'https://source-server.example/hash3...'
];

const results = await blossom.mirrorBlobs(
    sourceUrls,
    'https://target-server.example'
);

// results contains information about each mirroring operation
results.forEach(result => {
    if (result.success) {
        console.log(`Successfully mirrored ${result.sourceUrl} to ${result.targetUrl}`);
    } else {
        console.error(`Failed to mirror ${result.sourceUrl}: ${result.error}`);
    }
});
```

## Mirroring All User Blobs

To mirror all of a user's blobs to a new server:

```typescript
// Get a user
const userPubkey = 'npub...'; // Replace with actual pubkey
const user = ndk.getUser({ npub: userPubkey });

// Mirror all the user's blobs to a new server
const mirrorResults = await blossom.mirrorAllUserBlobs(
    user,
    'https://target-server.example'
);

console.log(`Successfully mirrored ${mirrorResults.succeeded.length} blobs`);
console.log(`Failed to mirror ${mirrorResults.failed.length} blobs`);
```

## Progress Tracking

For long mirroring operations, you can track progress:

```typescript
// Mirror with progress tracking
blossom.onMirrorProgress = (current, total, sourceUrl) => {
    const percentage = (current / total) * 100;
    console.log(`Mirroring progress: ${percentage.toFixed(2)}% (${current}/${total})`);
    console.log(`Currently mirroring: ${sourceUrl}`);
};

// Start the mirroring operation
await blossom.mirrorAllUserBlobs(user, 'https://target-server.example');
```

## Error Handling

Mirroring operations can fail for various reasons:
- Source server is down
- Target server rejects the upload
- Authorization issues
- Network problems

Handle errors appropriately:

```typescript
try {
    await blossom.mirrorBlob(sourceUrl, targetServer);
    console.log('Mirroring successful');
} catch (error) {
    console.error('Mirroring failed:', error);
    
    // You can check the specific error
    if (error.code === 'SOURCE_NOT_FOUND') {
        console.error('The source blob does not exist');
    } else if (error.code === 'TARGET_REJECTED') {
        console.error('The target server rejected the upload');
    }
}
```

## Authentication

Mirroring operations require authentication to prove you have the right to upload to the target server. NDK-Blossom handles this automatically using the NDK's signing capabilities.

Make sure you have a signer configured with your NDK instance:

```typescript
const ndk = new NDK({
    signer: new NDKPrivateKeySigner('nsec...'),
    // Other NDK options
});

const blossom = new NDKBlossom(ndk);

// Now mirroring operations will be properly authenticated
await blossom.mirrorBlob(sourceUrl, targetServer);
``` 