# NDK Mobile Signature Verification Module

A native Schnorr signature verification module for NDK Mobile that provides significant performance improvements over JavaScript-based verification, especially on mobile devices.

## Overview

This module implements native Schnorr signature verification using the secp256k1 library from Bitcoin Core. It provides:

- Native C++/Objective-C++ implementation for both Android and iOS
- JavaScript wrapper with TypeScript typings
- Expo EAS plugin for seamless integration
- Significant performance improvements over JavaScript-based verification

## Installation

### For Applications Using NDK Mobile

If you're using NDK Mobile in your Expo-managed application, the signature verification module is included as part of the package. Make sure you have the latest version of NDK Mobile:

```bash
bun add @nostr-dev-kit/ndk-mobile
```

### For Development of NDK Mobile

If you're developing NDK Mobile itself, the module is already included in the repository.

## Integration into Your Expo-managed App

### 1. Configure Expo Plugin

Make sure your app's `app.json` or `app.config.js` includes the plugin:

```json
{
  "expo": {
    "plugins": [
      "ndk-mobile-sig-check"
    ]
  }
}
```

### 2. Prebuild Your App

Run the Expo prebuild command to generate the native code:

```bash
expo prebuild
```

### 3. Build with EAS

Build your app using EAS:

```bash
eas build --platform android
eas build --platform ios
```

## Usage with NDK

Import the `verifySignatureAsync` function and set it as the signature verification function for your NDK instance:

```typescript
import { verifySignatureAsync } from "@nostr-dev-kit/ndk-mobile/sig-check-module";
import { NDK } from "@nostr-dev-kit/ndk";

// Create your NDK instance
const ndk = new NDK();

// Set the signature verification function
ndk.signatureVerificationFunction = verifySignatureAsync;

// Now all event signature verifications will use the native implementation
```

## How It Works

1. The JavaScript wrapper uses the `sha256` function from `@noble/hashes` to hash the event data
2. The native module (injected via JSI) verifies the signature using the secp256k1 library
3. The result is returned as a boolean indicating whether the signature is valid

## Troubleshooting

### Android Build Issues

If you encounter issues with the Android build, check the following:

- Make sure you have the Android NDK installed
- Ensure your `compileSdkVersion` and `minSdkVersion` match the requirements in the module's `build.gradle`
- Check the CMake logs for any errors related to secp256k1

### iOS Build Issues

If you encounter issues with the iOS build, check the following:

- Make sure you have Xcode installed with command-line tools
- Check the Pod installation logs for any errors
- Ensure the `libsecp256k1.a` file is properly included in the build

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This module is licensed under the MIT License.