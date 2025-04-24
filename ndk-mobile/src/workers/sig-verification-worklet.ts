import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { Buffer } from "buffer";

// Reanimated detection
let runOnJS: (fn: Function) => Function;
let runOnUI: (fn: Function) => Function;
let useWorkletCallback: (fn: Function, deps: any[]) => Function;
let reanimatedAvailable = false;

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Reanimated = require("react-native-reanimated");
    runOnJS = Reanimated.runOnJS;
    runOnUI = Reanimated.runOnUI;
    useWorkletCallback = Reanimated.useWorkletCallback;
    reanimatedAvailable = true;
} catch {
    console.warn(
        "react-native-reanimated not available or incompatible. Falling back to main thread verification."
    );
    runOnJS = (fn: Function) => fn;
    runOnUI = (fn: Function) => (...args: any[]) => {
        const callback = args[args.length - 1];
        try {
            const result = fn(...args);
            callback(result);
        } catch {
            callback(false);
        }
        return undefined;
    };
    useWorkletCallback = (fn: Function) => fn;
}

// Pure-JS UTF-8 encoder (worklet-friendly)
function utf8Encode(str: string): Uint8Array {
    "worklet";
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 0x80) {
            bytes.push(c);
        } else if (c < 0x800) {
            bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
        } else if (c < 0xd800 || c >= 0xe000) {
            bytes.push(
                0xe0 | (c >> 12),
                0x80 | ((c >> 6) & 0x3f),
                0x80 | (c & 0x3f)
            );
        } else {
            // surrogate pair
            i++;
            const c2 = str.charCodeAt(i);
            const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
            bytes.push(
                0xf0 | (cp >> 18),
                0x80 | ((cp >> 12) & 0x3f),
                0x80 | ((cp >> 6) & 0x3f),
                0x80 | (cp & 0x3f)
            );
        }
    }
    console.log('[NDK-MOBILE] utf8Encode', {str, bytes});
    return new Uint8Array(bytes);
}

// Pure-JS hex string → bytes (worklet-friendly)
function hexToBytes(hex: string): Uint8Array {
    "worklet";
    const len = hex.length >> 1;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
}

/**
 * Runs entirely in JSI worklet. No Node or Web polyfills.
 */
export function verifySignatureWorklet(
    serialized: string,
    id: string,
    sig: string,
    pubkey: string,
    callback: (res: boolean) => void
) {
    "worklet";
    try {
      console.log('[NDK-MOBILE] running inside the worklet', {reanimatedAvailable});
        // const eventHash = sha256(utf8Encode(serialized));
        // console.log('[NDK-MOBILE] eventHash', {eventHash});
        const idHash = hexToBytes(id);
        console.log('[NDK-MOBILE] idHash', {idHash});

        let ok = true;
        // console.log('[NDK-MOBILE] eventHash.length === idHash.length', {ok});
        // if (ok) {
        //     for (let i = 0; i < eventHash.length; i++) {
        //         if (eventHash[i] !== idHash[i]) {
        //             ok = false;
        //             break;
        //         }
        //     }
        // }
        
        console.log('running verifySignatureWorklet', {ok}, schnorr.verify);

        if (ok) {
            ok = schnorr.verify(sig, idHash, pubkey);
            console.log('[NDK-MOBILE] schnorr.verify', {ok});
        }


        runOnJS(callback)(ok);
    } catch (e) {
        console.error("Signature verify error:", e, { serialized, id, sig, pubkey });
        runOnJS(callback)(false);
    }
}

/**
 * Async wrapper matching NDK’s signatureVerificationFunction interface
 */
export async function verifySignatureAsync(event: NDKEvent): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        console.log('[NDK-MOBILE] verifySignatureAsync', {reanimatedAvailable});
        const serialized = event.serialize();
        if (reanimatedAvailable) {
            runOnUI(verifySignatureWorklet)(
                serialized,
                event.id,
                event.sig!,
                event.pubkey!,
                resolve
            );
        } else {
            // Main-thread fallback (still uses TextEncoder/Buffer)
            try {
                const eventHash = sha256(
                    new TextEncoder().encode(serialized)
                );
                const buf = Buffer.from(event.id, "hex");
                const idHash = Uint8Array.from(buf);

                let ok = eventHash.length === idHash.length;
                if (ok) {
                    for (let i = 0; i < eventHash.length; i++) {
                        if (eventHash[i] !== idHash[i]) {
                            ok = false;
                            break;
                        }
                    }
                }
                if (ok) {
                    ok = schnorr.verify(
                        event.sig!,
                        buf,
                        event.pubkey!
                    );
                }
                resolve(ok);
            } catch (e) {
                console.error("Signature verify error:", e);
                resolve(false);
            }
        }
    });
}

/**
 * Hook for components
 */
export function useSignatureVerification() {
    return useWorkletCallback((event: NDKEvent) => {
        return verifySignatureAsync(event);
    }, []);
}
