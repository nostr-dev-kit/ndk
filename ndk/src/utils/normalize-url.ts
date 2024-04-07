import normalizeUrl from "normalize-url";

/**
 * Normalizes a relay URL by removing authentication, www, and hash,
 * and ensures that it ends with a slash.
 *
 * @param url - The URL to be normalized.
 * @returns The normalized URL.
 */
export function normalizeRelayUrl(url: string): string {
    let r = normalizeUrl(url, {
        stripAuthentication: false,
        stripWWW: false,
        stripHash: true,
    });

    // if it doesn't end with a slash, add it
    if (!r.endsWith("/")) {
        r += "/";
    }

    return r;
}

/**
 * Normalizes an array of URLs by removing duplicates and applying a normalization function to each URL.
 * Any URLs that fail to normalize will be ignored.
 *
 * @param urls - An array of URLs to be normalized.
 * @returns An array of normalized URLs without duplicates.
 */
export function normalize(urls: string[]): string[] {
    const normalized = new Set<string>();

    for (const url of urls) {
        try {
            normalized.add(normalizeRelayUrl(url));
        } catch {
            /**/
        }
    }

    return Array.from(normalized);
}
