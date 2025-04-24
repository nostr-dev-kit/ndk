# Signature Verification in React Native

NDK provides a custom signature verification implementation for React Native/Expo applications that uses Reanimated worklets to perform verification in a separate thread, preventing UI blocking.

## Overview

In browser environments, NDK uses Web Workers for signature verification to avoid blocking the main thread. However, Web Workers are not available in React Native. Instead, NDK Mobile provides a Reanimated worklet-based solution that achieves the same goal.

## Installation

First, make sure you have the required dependencies:

```bash
# Using npm
npm install react-native-reanimated

# Using yarn
yarn add react-native-reanimated

# Using bun
bun add react-native-reanimated
```

## Configuration

### 1. Configure Babel plugin

Add the Reanimated Babel plugin to your `babel.config.js`:

```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // ... other plugins
    'react-native-reanimated/plugin',
  ],
};
```

### 2. Configure your Expo app (for Expo managed workflow)

Add Reanimated to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "YourApp",
    "plugins": [
      [
        "react-native-reanimated"
      ]
    ]
  }
}
```

## Usage

### Basic Setup

In your app's entry point, initialize the signature verification worklet:

```typescript
import { initSignatureVerificationWorklet } from '@nostr-dev-kit/ndk-mobile';
import NDK from '@nostr-dev-kit/ndk';

// Create your NDK instance
const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol'],
});

// Initialize the signature verification worklet
initSignatureVerificationWorklet(ndk);

// Listen for invalid signatures
ndk.on('event:invalid-sig', (event) => {
  console.log('Invalid signature detected:', event.id);
});

// Connect to relays
await ndk.connect();
```

### Direct Usage

You can also use the verification function directly:

```typescript
import { verifySignatureAsync } from '@nostr-dev-kit/ndk-mobile';
import { NDKEvent } from '@nostr-dev-kit/ndk';

async function checkSignature(event: NDKEvent) {
  const isValid = await verifySignatureAsync(event);
  console.log(`Event ${event.id} signature is ${isValid ? 'valid' : 'invalid'}`);
}
```

## How It Works

The signature verification worklet uses Reanimated's `runOnUI` function to execute the verification logic on a separate thread. This prevents the UI from freezing during intensive cryptographic operations.

The implementation follows these steps:

1. The worklet calculates the event hash using SHA-256
2. It compares the calculated hash with the event ID
3. If the hashes match, it verifies the signature using the schnorr algorithm
4. The result is sent back to the main thread

## Performance Considerations

- The worklet approach significantly improves UI responsiveness compared to running verification on the main thread
- The first verification might be slightly slower due to worklet initialization
- For high-volume applications, consider implementing batching for multiple verifications

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Make sure you have the correct types installed for react-native-reanimated
2. **Worklet not running**: Ensure you've properly configured the Babel plugin
3. **Verification always failing**: Check that the event has valid signature and pubkey fields

### Debugging

You can add debug logs to track the verification process:

```typescript
import { verifySignatureAsync } from '@nostr-dev-kit/ndk-mobile';

async function debugVerification(event) {
  console.log('Starting verification for event:', event.id);
  const isValid = await verifySignatureAsync(event);
  console.log(`Verification result for ${event.id}: ${isValid}`);
}