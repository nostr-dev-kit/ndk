import NDK from "@nostr-dev-kit/ndk-hooks";
import { verifySignatureAsync } from "./sig-verification-worklet.js";

// Check if Reanimated is available
let reanimatedAvailable = false;
try {
  require('react-native-reanimated');
  reanimatedAvailable = true;
} catch (e) {
  console.warn('react-native-reanimated not available or incompatible version. Signature verification will run on the main thread.');
}

/**
 * Initialize NDK with the signature verification worklet
 *
 * @param ndk The NDK instance to initialize
 * @returns boolean indicating if the worklet was successfully initialized
 */
export function initSignatureVerificationWorklet(ndk: NDK): boolean {
  // Set the custom signature verification function
  ndk.signatureVerificationFunction = verifySignatureAsync;

  return reanimatedAvailable;
}