# NDK Mobile Signature Verification Worklet

This module provides a signature verification worklet for React Native/Expo applications using Reanimated. It allows signature verification to run in a separate thread without blocking the UI.

## Installation

The signature verification worklet requires react-native-reanimated as a peer dependency. Make sure you have it installed:

```bash
# Using npm
npm install react-native-reanimated

# Using yarn
yarn add react-native-reanimated

# Using bun
bun add react-native-reanimated
```

> **Note:** The worklet is compatible with react-native-reanimated version 3.16.0 or higher. If Reanimated is not available or an incompatible version is detected, the verification will fall back to running on the main thread.

### Buffer Polyfill

The worklet uses the `Buffer` class from the 'buffer' npm package, which is included as a dependency of ndk-mobile. You don't need to install it separately.

If your app already has a Buffer polyfill, there should be no conflicts as long as it provides the standard Buffer API.

## Setup

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

### 2. Configure your Expo app

For Expo managed workflow, add Reanimated to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "YourApp",
    "plugins": [
      [
        "react-native-reanimated",
        {
          "relativeSourcePath": "./src"
        }
      ]
    ]
  }
}
```

### 3. Initialize the worklet in your app

In your app's entry point (e.g., `App.js` or `index.js`), initialize the signature verification worklet:

```javascript
import { initSignatureVerificationWorklet } from '@nostr-dev-kit/ndk-mobile';
import NDK from '@nostr-dev-kit/ndk';

// Create your NDK instance
const ndk = new NDK({
  // Your NDK configuration
});

// Initialize the signature verification worklet
// Returns true if Reanimated is available and properly initialized
const isUsingWorklet = initSignatureVerificationWorklet(ndk);

if (isUsingWorklet) {
  console.log('Using Reanimated worklet for signature verification');
} else {
  console.log('Falling back to main thread for signature verification');
}

// Now NDK will use the verification function (either worklet or main thread)
// You can listen for invalid signatures
ndk.on('event:invalid-sig', (event) => {
  console.log('Invalid signature detected:', event.id);
});

// Connect to relays
ndk.connect();
```

## How It Works

The signature verification worklet uses Reanimated to run the verification process in a separate thread, preventing UI blocking. It implements the same verification logic as the browser-based Web Worker implementation but adapted for React Native.

This implementation uses the new pluggable verification function feature in NDK, which allows you to provide a custom function for signature verification.

## Advanced Usage

### Direct usage of the verification function

You can also use the verification function directly if needed:

```javascript
import { verifySignatureAsync } from '@nostr-dev-kit/ndk-mobile';

async function checkSignature(event) {
  const isValid = await verifySignatureAsync(event);
  console.log(`Event ${event.id} signature is ${isValid ? 'valid' : 'invalid'}`);
}
```

## Troubleshooting

### Reanimated not working properly

If you encounter issues with Reanimated:

1. Make sure you've added the Babel plugin correctly
2. For Expo, ensure you've configured the plugin in app.json/app.config.js
3. Check that your Reanimated version is 3.16.0 or higher
4. Rebuild your app completely (clear cache if needed)

```bash
# Clear cache and rebuild
expo start -c
```

### Fallback to main thread

The worklet will automatically fall back to running on the main thread if:

1. Reanimated is not installed
2. An incompatible version of Reanimated is detected
3. There's an error initializing the worklet

You can check if the worklet is being used by checking the return value of `initSignatureVerificationWorklet()`.

### TypeScript errors

If you're using TypeScript and encounter type errors:

1. Make sure you have the correct types installed
2. You may need to add a declaration file for the worklet if TypeScript can't find it

## Performance Considerations

The worklet significantly improves UI performance by moving signature verification off the main thread. However, keep in mind:

1. The first verification might be slightly slower due to worklet initialization
2. Very high volumes of verifications might still cause performance issues
3. Consider implementing batching for multiple verifications if needed
4. When falling back to the main thread, verification will block the UI thread, so performance may be affected

## Version Compatibility

This module is designed to be compatible with various versions of react-native-reanimated:

- **Optimal:** Works best with the version specified in the peer dependencies (3.16.0 or higher)
- **Fallback:** Will fall back to main thread verification if Reanimated is not available or incompatible
- **No Breaking Changes:** Your app will continue to function even if there are version mismatches