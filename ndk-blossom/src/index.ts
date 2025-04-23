/**
 * NDK-Blossom - Blossom protocol support for NDK
 *
 * This package extends NDK with support for the Blossom protocol,
 * allowing you to easily upload, manage, and fix URLs for blobs
 * (binary data like images, videos, etc.) stored on Blossom servers.
 */

// Export the main class and types from the blossom module
export { default as NDKBlossom } from "./blossom";
export * from "./blossom";

// Export utility functions for direct usage if needed
export { extractHashFromUrl } from "./healing/url-healing";

// Export SHA256 utilities
export { SHA256Calculator } from "./types";
export { DefaultSHA256Calculator, defaultSHA256Calculator } from "./utils/sha256";

// Set default export
import NDKBlossom from "./blossom";
export default NDKBlossom;
