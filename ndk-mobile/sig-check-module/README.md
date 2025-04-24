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

To use this native signature verification module in your Expo-managed application, you need to:

1. Install the NDK Mobile package:

```bash
# Using npm
npm install @nostr-dev-kit/ndk-mobile

# Using yarn
yarn add @nostr-dev-kit/ndk-mobile

# Using bun
bun add @nostr-dev-kit/ndk-mobile
```

2. Add the plugin to your app's `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "ndk-mobile-sig-check"
    ]
  }
}
```

The plugin is automatically included when you install `@nostr-dev-kit/ndk-mobile`, so you don't need to install it separately.

### How the Plugin Connection Works

When you install `@nostr-dev-kit/ndk-mobile`, Expo looks at its package.json file, which contains:

```json
"expo": {
  "plugins": [
    {
      "name": "ndk-mobile-sig-check",
      "path": "./sig-check-module/expo-plugin.js"
    }
  ]
}
```

This configuration tells Expo:
1. There's a plugin named "ndk-mobile-sig-check" in this package
2. The plugin's code is located at "./sig-check-module/expo-plugin.js"

When your app's app.json references "ndk-mobile-sig-check", Expo knows to look for this plugin in the installed packages and finds it in `@nostr-dev-kit/ndk-mobile`.

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

After installing the package and configuring the plugin, you need to import the `verifySignatureAsync` function and set it as the signature verification function for your NDK instance:

```typescript
// Import the verification function from the NDK Mobile package
import { verifySignatureAsync } from "@nostr-dev-kit/ndk-mobile/sig-check-module";
import { NDK } from "@nostr-dev-kit/ndk";

// Create your NDK instance
const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.example.com"]
});

// Set the signature verification function
ndk.signatureVerificationFunction = verifySignatureAsync;

// Now all event signature verifications will use the native implementation
// This provides significant performance improvements over JavaScript-based verification
```

This integration ensures that all signature verifications in your app will use the native implementation, which is much faster than the JavaScript-based verification, especially on mobile devices.

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

## Recompiling the Native Code

If you need to make changes to the native code or update the secp256k1 library, you'll need to recompile the native components.

### Android

For Android, the native code is compiled using CMake when the app is built. If you modify the C++ code:

1. Make your changes to `android/jsi-schnorr.cpp` or `CMakeLists.txt`
2. Run `expo prebuild --platform android` to regenerate the native project
3. Build with `eas build --platform android` or run locally with `expo run:android`

### iOS

For iOS, you need to compile the secp256k1 library and create the static library:

1. If you've modified the secp256k1 submodule, first update it:
   ```bash
   cd native/secp256k1
   git pull origin master
   ```

2. Compile the secp256k1 library for iOS:
   ```bash
   # Navigate to the secp256k1 directory
   cd native/secp256k1

   # Configure for iOS
   ./autogen.sh
   ./configure --enable-module-schnorrsig --disable-shared --enable-static

   # Build
   make
   ```

3. Create a fat binary for both device and simulator architectures:
   ```bash
   # For device (arm64)
   xcrun --sdk iphoneos clang -c -arch arm64 src/*.c -I./include -o libsecp256k1-arm64.a

   # For simulator (x86_64)
   xcrun --sdk iphonesimulator clang -c -arch x86_64 src/*.c -I./include -o libsecp256k1-x86_64.a

   # Create fat binary
   lipo -create libsecp256k1-arm64.a libsecp256k1-x86_64.a -output ../../ios/libsecp256k1.a
   ```

4. If you've modified the Objective-C++ code in `ios/jsi-schnorr.mm`, update it as needed

5. Run `expo prebuild --platform ios` to regenerate the native project
6. Build with `eas build --platform ios` or run locally with `expo run:ios`

### JavaScript Wrapper

If you've modified the JavaScript wrapper:

1. Make your changes to `src/index.ts`
2. Rebuild the TypeScript files:
   ```bash
   cd sig-check-module
   bun run build
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This module is licensed under the MIT License.