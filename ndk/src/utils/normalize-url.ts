import normalizeUrl from "normalize-url";

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

export function normalize(urls: string[]): string[] {
    return urls.map(normalizeRelayUrl);
}
