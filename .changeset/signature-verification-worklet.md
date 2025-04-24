---
"@nostr-dev-kit/ndk-mobile": minor
---

Add signature verification worklet for React Native/Expo applications. This implementation leverages React Native Reanimated worklets to perform cryptographic signature verification in a separate thread, preventing UI blocking while maintaining the security and integrity of the Nostr protocol. The feature includes:

- A Reanimated worklet for signature verification that runs on a separate thread
- An adapter to connect the worklet with NDK core
- Support for pluggable verification functions in NDK core
- Comprehensive documentation and examples for integration
- Performance optimizations and error handling