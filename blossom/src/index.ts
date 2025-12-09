/**
 * NDK-Blossom - Blossom protocol support for NDK
 *
 * This package extends NDK with support for the Blossom protocol,
 * allowing you to easily upload, manage, and fix URLs for blobs
 * (binary data like images, videos, etc.) stored on Blossom servers.
 */

export * from "./blossom.js";
// Export the main class and types from the blossom module
export { default as NDKBlossom } from "./blossom.js";

// Export utility functions for direct usage if needed
export { extractHashFromUrl } from "./healing/url-healing.js";

// Export SHA256 utilities
export type { SHA256Calculator } from "./types/index.js";
export { DefaultSHA256Calculator, defaultSHA256Calculator } from "./utils/sha256.js";

// Set default export
import NDKBlossom from "./blossom.js";
export default NDKBlossom;
