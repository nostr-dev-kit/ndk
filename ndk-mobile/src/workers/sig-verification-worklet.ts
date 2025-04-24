import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { Buffer } from 'buffer';

// Try to import Reanimated, but don't fail if it's not available or incompatible
let runOnJS: (fn: Function) => Function;
let runOnUI: (fn: Function) => Function;
let useWorkletCallback: (fn: Function, deps: any[]) => Function;
let reanimatedAvailable = false;

try {
  const Reanimated = require('react-native-reanimated');
  runOnJS = Reanimated.runOnJS;
  runOnUI = Reanimated.runOnUI;
  useWorkletCallback = Reanimated.useWorkletCallback;
  reanimatedAvailable = true;
} catch (e) {
  console.warn('react-native-reanimated not available or incompatible version. Falling back to main thread verification.');
  // Provide fallback implementations that just run on the main thread
  runOnJS = (fn: Function) => fn;
  runOnUI = (fn: Function) => (...args: any[]) => {
    // Extract the callback which is the last argument
    const callback = args[args.length - 1];
    // Call the function directly on the main thread
    try {
      const result = fn(...args);
      callback(result);
    } catch (e) {
      callback(false);
    }
    return undefined;
  };
  useWorkletCallback = (fn: Function) => fn;
}

/**
 * Worklet function that performs signature verification
 * This runs on a separate thread to avoid blocking the UI
 */
export function verifySignatureWorklet(
  serialized: string,
  id: string,
  sig: string,
  pubkey: string,
  callback: (result: boolean) => void
) {
  'worklet';
  try {
    // Calculate the event hash
    const eventHash = sha256(new TextEncoder().encode(serialized));
    const buffer = Buffer.from(id, "hex");
    const idHash = Uint8Array.from(buffer);

    // Compare the hashes
    let result = true;
    if (eventHash.length !== idHash.length) {
      result = false;
    } else {
      for (let i = 0; i < eventHash.length; i++) {
        if (eventHash[i] !== idHash[i]) {
          result = false;
          break;
        }
      }
    }

    // If hashes match, verify the signature
    if (result) {
      result = schnorr.verify(sig, buffer, pubkey);
    }

    console.log("Signature verification result:", result, id, sig);

    // Send the result back to the JS thread
    runOnJS(callback)(result);
  } catch (_err) {
    // On any error, avoid crashing the UI thread and report invalid signature
    runOnJS(callback)(false);
  }
}

/**
 * Verify a signature asynchronously using the worklet
 * This function matches the interface expected by NDK's signatureVerificationFunction
 *
 * @param event The NDK event to verify
 * @returns Promise that resolves to a boolean indicating if the signature is valid
 */
export async function verifySignatureAsync(event: NDKEvent): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const serialized = event.serialize();
    
    if (reanimatedAvailable) {
      // Run the verification in a worklet if Reanimated is available
      runOnUI(verifySignatureWorklet)(
        serialized,
        event.id,
        event.sig!,
        event.pubkey!,
        resolve
      );
    } else {
      // Fall back to main thread verification if Reanimated is not available
      try {
        // Calculate the event hash
        const eventHash = sha256(new TextEncoder().encode(serialized));
        // Use Buffer from the 'buffer' package
        const buffer = Buffer.from(event.id, "hex");
        const idHash = Uint8Array.from(buffer);

        // Compare the hashes
        let result = true;
        if (eventHash.length !== idHash.length) {
          result = false;
        } else {
          for (let i = 0; i < eventHash.length; i++) {
            if (eventHash[i] !== idHash[i]) {
              result = false;
              break;
            }
          }
        }

        // If hashes match, verify the signature
        if (result) {
          result = schnorr.verify(event.sig!, buffer, event.pubkey!);
        }

        resolve(result);
      } catch (e) {
        console.error('Error verifying signature on main thread:', e);
        resolve(false);
      }
    }
  });
}

/**
 * Hook to create a signature verification function that can be used in components
 */
export function useSignatureVerification() {
  return useWorkletCallback((event: NDKEvent) => {
    return verifySignatureAsync(event);
  }, []);
}