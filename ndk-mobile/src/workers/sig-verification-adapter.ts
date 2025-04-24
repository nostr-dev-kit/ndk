import NDK from "@nostr-dev-kit/ndk-hooks";
import { verifySignatureAsync } from "./sig-verification-worklet.js";

/**
 * Initialize NDK with the signature verification worklet
 *
 * @param ndk The NDK instance to initialize
 */
export function initSignatureVerificationWorklet(ndk: NDK): void {
  // Set the custom signature verification function
  ndk.signatureVerificationFunction = verifySignatureAsync;
  
  // Listen for invalid signatures
  ndk.on("event:invalid-sig", (event) => {
    console.warn("Invalid signature detected:", event.id);
  });
}