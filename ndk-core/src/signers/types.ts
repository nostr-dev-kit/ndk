import type { NDK } from "../ndk/index.js";
import type { NDKSigner } from "./index.js";

/**
 * Export the type of ndkSignerFromPayload to avoid circular dependencies
 */
export type ndkSignerFromPayload = (payloadString: string, ndk?: NDK) => Promise<NDKSigner>;
