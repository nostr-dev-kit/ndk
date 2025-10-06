# Error Handling in NDK-Blossom

Working with remote servers always introduces potential failure points. NDK-Blossom provides comprehensive error handling to help you build robust applications.

## Error Types

NDK-Blossom defines specific error types for different failure scenarios:

```typescript
// Import error types
import { 
    NDKBlossomError,
    NDKBlossomUploadError, 
    NDKBlossomServerError,
    NDKBlossomAuthError,
    NDKBlossomNotFoundError
} from '@nostr-dev-kit/blossom';
```

All errors extend from `NDKBlossomError`, which includes:

- `message`: Human-readable error message
- `code`: Machine-readable error code
- `serverUrl`: The Blossom server URL that generated the error (if applicable)
- `cause`: Original error that caused this error (if applicable)

## Error Callbacks

NDK-Blossom provides callback hooks for error handling:

```typescript
// Create NDKBlossom instance
const blossom = new NDKBlossom(ndk);

// Set error callbacks
blossom.onUploadFailed = (error: string, serverUrl: string, file: File) => {
    console.error(`Upload to ${serverUrl} failed: ${error}`);
    logErrorToAnalytics('upload_failed', { serverUrl, error });
};

blossom.onServerError = (error: NDKBlossomServerError) => {
    console.error(`Server error: ${error.message}`);
    if (error.status === 429) {
        console.warn(`Rate limited by ${error.serverUrl}`);
    }
};

// Use NDK-Blossom operations normally
await blossom.upload(file);
```

## Try/Catch Pattern

For synchronous error handling, use try/catch:

```typescript
try {
    const imeta = await blossom.upload(file);
    // Success: use imeta
} catch (error) {
    if (error instanceof NDKBlossomUploadError) {
        console.error(`Upload failed: ${error.message}`);
        
        // Check specific error codes
        if (error.code === 'SERVER_LIST_EMPTY') {
            // No servers available
            promptUserToAddServers();
        } else if (error.code === 'ALL_SERVERS_FAILED') {
            // All servers rejected the upload
            showUploadFailedNotification();
        }
    } else if (error instanceof NDKBlossomAuthError) {
        console.error(`Authentication error: ${error.message}`);
        
        if (error.code === 'NO_SIGNER') {
            // No signer available
            promptUserToSignIn();
        }
    } else {
        // Other error
        console.error('Unexpected error:', error);
    }
}
```

## Error Codes

NDK-Blossom uses consistent error codes across all error types:

### Server-Related Errors
- `SERVER_UNAVAILABLE`: Server is not responding
- `SERVER_ERROR`: Server returned an error (5xx)
- `SERVER_REJECTED`: Server rejected the request (4xx)
- `SERVER_TIMEOUT`: Request timed out
- `SERVER_LIST_EMPTY`: No servers available to try
- `SERVER_INVALID_RESPONSE`: Server response was invalid

### Authentication Errors
- `NO_SIGNER`: No signer available for authentication
- `AUTH_REQUIRED`: Authentication required but not provided
- `AUTH_INVALID`: Authentication invalid (wrong pubkey or signature)
- `AUTH_EXPIRED`: Authentication expired
- `AUTH_REJECTED`: Authentication rejected by server

### Upload Errors
- `UPLOAD_TOO_LARGE`: File is too large for server
- `UPLOAD_INVALID_TYPE`: File type not accepted
- `UPLOAD_FAILED`: Upload failed for other reasons
- `ALL_SERVERS_FAILED`: All server upload attempts failed

### Not Found Errors
- `BLOB_NOT_FOUND`: Blob not found on any server
- `USER_SERVER_LIST_NOT_FOUND`: User's server list not found

## Retry Strategies

NDK-Blossom implements automatic retry strategies for transient errors:

```typescript
// Configure retry behavior
blossom.setRetryOptions({
    maxRetries: 3,           // Maximum number of retries
    retryDelay: 1000,        // Initial delay in milliseconds
    backoffFactor: 2,        // Exponential backoff factor
    retryableStatusCodes: [429, 503] // HTTP status codes to retry
});

// The upload will now automatically retry on transient errors
const imeta = await blossom.upload(file);
```

## Custom Error Handling

For advanced use cases, you can override the default error handling:

```typescript
// Custom upload with custom error handling
const result = await blossom.upload(file, {
    onServerError: (error, serverUrl) => {
        // Custom server error handling
        console.error(`Server ${serverUrl} error:`, error);
        
        // Decide whether to retry on this server
        return error.status === 429 ? 'retry' : 'skip';
    },
    maxRetries: 5,
    retryDelay: 2000
});
```

## Tracking Upload Progress

Monitor upload progress and handle errors during upload:

```typescript
blossom.onUploadProgress = (progress, file, serverUrl) => {
    // Update progress UI
    updateProgressBar(progress.loaded / progress.total);
    
    // Optionally, allow cancellation
    if (shouldCancel()) {
        return 'cancel';
    }
    
    return 'continue';
};

// Start the upload
const imeta = await blossom.upload(file);
```

## Logging and Debugging

Enable detailed logging for debugging:

```typescript
// Enable debug mode
blossom.debug = true;

// Set custom logger
blossom.logger = (level, message, data) => {
    switch (level) {
        case 'error':
            console.error(message, data);
            break;
        case 'warn':
            console.warn(message, data);
            break;
        case 'info':
            console.info(message, data);
            break;
        case 'debug':
            console.debug(message, data);
            break;
    }
};

// Operations will now produce detailed logs
await blossom.upload(file);
```

## Handling Multiple Operations

When working with multiple operations, manage errors collectively:

```typescript
// Upload multiple files
const results = await Promise.allSettled(
    files.map(file => blossom.upload(file))
);

// Process results
const succeeded = results
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<any>).value);

const failed = results
    .filter(result => result.status === 'rejected')
    .map(result => (result as PromiseRejectedResult).reason);

console.log(`Uploaded ${succeeded.length} files, ${failed.length} failed`);

// Handle failed uploads
if (failed.length > 0) {
    notifyUserOfFailures(failed);
} 